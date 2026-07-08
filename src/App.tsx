/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import {
  StudentProfile,
  RoadmapData,
  StudyPlan,
  ProjectMentorData,
  ResumeAnalysisData,
  SkillGapData,
  DashboardAnalytics,
  MentorMessage,
  CompleteStudentData
} from "./types";
import {
  generateRoadmap,
  generateLearningPlan,
  generateProjects,
  analyzeProfileResume,
  analyzeSkillGap,
  generateAnalytics,
  sendMentorMessage
} from "./lib/api";

// Component imports
import LandingPage from "./components/LandingPage";
import Sidebar, { ViewType } from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import TwinView from "./components/TwinView";
import MentorHubView from "./components/MentorHubView";
import LearningCoachView from "./components/LearningCoachView";
import ProjectMentorView from "./components/ProjectMentorView";
import RoadmapView from "./components/RoadmapView";
import ResumeAnalyzerView from "./components/ResumeAnalyzerView";
import SkillGapView from "./components/SkillGapView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [fullData, setFullData] = useState<CompleteStudentData | null>(null);

  // Nav views
  const [currentView, setView] = useState<ViewType>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  // States
  const [appLoading, setAppLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize and load session from local storage & Firestore
  useEffect(() => {
    async function loadSession() {
      const savedId = localStorage.getItem("careercompass_student_id");
      if (savedId) {
        setStudentId(savedId);
        try {
          const studentDocRef = doc(db, "students", savedId);
          const snap = await getDoc(studentDocRef);
          if (snap.exists()) {
            const data = snap.data() as CompleteStudentData;
            setProfile(data.profile);
            setFullData(data);
          } else {
            // Clean up stale session
            localStorage.removeItem("careercompass_student_id");
            setStudentId(null);
          }
        } catch (err) {
          console.error("Failed to load Firestore session:", err);
          setErrorMsg("Failed to connect to Firebase database.");
          handleFirestoreError(err, OperationType.GET, `students/${savedId}`);
        }
      }
      setAppLoading(false);
    }
    loadSession();
  }, []);

  // Onboarding action: create digital twin and run initial agents
  const handleOnboarding = async (data: {
    fullName: string;
    branch: string;
    academicYear: string;
    semester: string;
    careerGoal: string;
  }) => {
    const newId = "student_" + Math.random().toString(36).substring(2, 15);

    // Initial student twin memory profile
    const initialProfile: StudentProfile = {
      id: newId,
      fullName: data.fullName,
      branch: data.branch,
      academicYear: data.academicYear,
      semester: data.semester,
      careerGoal: data.careerGoal,
      cgpa: 0.0,
      skills: [],
      languages: [],
      frameworks: [],
      interests: [],
      dailyStudyHours: 2,
      preferredLearningStyle: "Practical",
      githubProfile: "",
      linkedinProfile: "",
      resumeText: "",
      resumeUrl: "",
      resumeFileName: "",
    };

    // Save in Firestore first to establish memory layer
    const studentDocRef = doc(db, "students", newId);
    const initialPayload: CompleteStudentData = {
      profile: initialProfile,
      messages: [],
    };
    
    try {
      await setDoc(studentDocRef, initialPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `students/${newId}`);
    }

    setStudentId(newId);
    setProfile(initialProfile);
    setFullData(initialPayload);
    localStorage.setItem("careercompass_student_id", newId);

    // Trigger background baseline calculations for smooth instant dashboard metrics
    try {
      await calculateAllAgentMinds(initialProfile, initialPayload, studentDocRef);
    } catch (e) {
      console.error("Baseline calculations failed. Using defaults.", e);
    }
  };

  // Helper to coordinate all agents at once
  const calculateAllAgentMinds = async (
    currentProfile: StudentProfile,
    currentFullData: CompleteStudentData,
    docRef: any
  ) => {
    setActionLoading(true);
    try {
      // Run Core Agents in parallel
      const [roadmapRes, studyPlanRes, projectsRes, skillGapRes, resumeRes] = await Promise.all([
        generateRoadmap(currentProfile),
        generateLearningPlan(currentProfile),
        generateProjects(currentProfile),
        analyzeSkillGap(currentProfile),
        analyzeProfileResume(currentProfile),
      ]);

      const roadmap: RoadmapData = {
        studentId: currentProfile.id,
        semesters: roadmapRes.semesters,
        lastUpdated: new Date().toISOString(),
      };

      const studyPlan: StudyPlan = {
        dailyPlan: studyPlanRes.dailyPlan,
        weeklyGoal: studyPlanRes.weeklyGoal,
        tips: studyPlanRes.tips,
        lastUpdated: new Date().toISOString(),
      };

      const projectMentor: ProjectMentorData = {
        studentId: currentProfile.id,
        projects: projectsRes.projects,
        lastUpdated: new Date().toISOString(),
      };

      const skillGap: SkillGapData = {
        dreamRole: currentProfile.careerGoal,
        currentSkills: skillGapRes.currentSkills,
        missingSkills: skillGapRes.missingSkills,
        skillMatchPercentage: skillGapRes.skillMatchPercentage,
        priorityLearningOrder: skillGapRes.priorityLearningOrder,
        estimatedWeeksToReady: skillGapRes.estimatedWeeksToReady,
        improvementPlan: skillGapRes.improvementPlan,
        lastUpdated: new Date().toISOString(),
      };

      const resumeAnalysis: ResumeAnalysisData = {
        atsScore: resumeRes.atsScore,
        skillsFeedback: resumeRes.skillsFeedback,
        projectsFeedback: resumeRes.projectsFeedback,
        formattingFeedback: resumeRes.formattingFeedback,
        keywordSuggestions: resumeRes.keywordSuggestions,
        achievementsFeedback: resumeRes.achievementsFeedback,
        improvements: resumeRes.improvements,
        generatedRawResume: resumeRes.generatedRawResume || "",
        lastUpdated: new Date().toISOString(),
      };

      // Aggregate into Analytics
      const analyticsRes = await generateAnalytics(currentProfile, {
        roadmap,
        studyPlan,
        projectMentor,
        resumeAnalysis,
        skillGap,
      });

      const analytics: DashboardAnalytics = {
        placementReadinessScore: analyticsRes.placementReadinessScore,
        skillsProgress: analyticsRes.skillsProgress,
        learningProgress: analyticsRes.learningProgress,
        roadmapCompletion: analyticsRes.roadmapCompletion,
        resumeScore: analyticsRes.resumeScore,
        skillGapScore: analyticsRes.skillGapScore,
        aiInsights: analyticsRes.aiInsights,
        recentRecommendations: analyticsRes.recentRecommendations,
        lastUpdated: new Date().toISOString(),
      };

      const updatedPayload: Partial<CompleteStudentData> = {
        roadmap,
        studyPlan,
        projectMentor,
        skillGap,
        resumeAnalysis,
        analytics,
      };

      try {
        await updateDoc(docRef, updatedPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
      }

      setFullData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...updatedPayload,
        };
      });
    } catch (err) {
      console.error("Critical error calculating agent minds:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Re-run all agent minds explicitly
  const handleTriggerRecalculateAllAgents = async () => {
    if (!studentId || !profile || !fullData) return;
    const studentDocRef = doc(db, "students", studentId);
    await calculateAllAgentMinds(profile, fullData, studentDocRef);
  };

  // Update specific twin profile elements
  const handleUpdateProfile = async (updatedFields: Partial<StudentProfile>) => {
    if (!studentId || !profile) return;
    const studentDocRef = doc(db, "students", studentId);

    const mergedProfile = {
      ...profile,
      ...updatedFields,
    };

    setProfile(mergedProfile);
    setFullData((prev) => {
      if (!prev) return prev;
      return { ...prev, profile: mergedProfile };
    });

    // Update Firestore
    try {
      await updateDoc(studentDocRef, { profile: mergedProfile });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
    }

    // Refresh analytics based on new profile parameters
    try {
      const analyticsRes = await generateAnalytics(mergedProfile, {
        roadmap: fullData?.roadmap,
        studyPlan: fullData?.studyPlan,
        projectMentor: fullData?.projectMentor,
        resumeAnalysis: fullData?.resumeAnalysis,
        skillGap: fullData?.skillGap,
      });

      const analytics: DashboardAnalytics = {
        placementReadinessScore: analyticsRes.placementReadinessScore,
        skillsProgress: analyticsRes.skillsProgress,
        learningProgress: analyticsRes.learningProgress,
        roadmapCompletion: analyticsRes.roadmapCompletion,
        resumeScore: analyticsRes.resumeScore,
        skillGapScore: analyticsRes.skillGapScore,
        aiInsights: analyticsRes.aiInsights,
        recentRecommendations: analyticsRes.recentRecommendations,
        lastUpdated: new Date().toISOString(),
      };

      try {
        await updateDoc(studentDocRef, { analytics });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
      }
      setFullData((prev) => {
        if (!prev) return prev;
        return { ...prev, analytics };
      });
    } catch (e) {
      console.error("Failed to automatically update analytics indices:", e);
    }
  };

  // Toggle study topic completed state
  const handleToggleTopic = async (dayIndex: number, topicId: string, completed: boolean) => {
    if (!studentId || !fullData?.studyPlan || !profile) return;
    const studentDocRef = doc(db, "students", studentId);

    // Deep copy studyPlan
    const studyPlanCopy = JSON.parse(JSON.stringify(fullData.studyPlan)) as StudyPlan;
    const topic = studyPlanCopy.dailyPlan[dayIndex].topics.find((t) => t.id === topicId);
    if (topic) {
      topic.completed = completed;
    }

    setFullData((prev) => {
      if (!prev) return prev;
      return { ...prev, studyPlan: studyPlanCopy };
    });

    // Save to Firestore
    try {
      await updateDoc(studentDocRef, { studyPlan: studyPlanCopy });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
    }

    // Recalculate learning progress metric
    try {
      const total = studyPlanCopy.dailyPlan.reduce((acc, curr) => acc + (curr.topics?.length || 0), 0);
      const done = studyPlanCopy.dailyPlan.reduce((acc, curr) => acc + (curr.topics?.filter((t) => t.completed).length || 0), 0);
      const learningProgress = total > 0 ? Math.round((done / total) * 100) : 0;

      const updatedAnalytics = {
        ...fullData.analytics,
        learningProgress,
        lastUpdated: new Date().toISOString(),
      } as DashboardAnalytics;

      try {
        await updateDoc(studentDocRef, { analytics: updatedAnalytics });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
      }
      setFullData((prev) => {
        if (!prev) return prev;
        return { ...prev, analytics: updatedAnalytics };
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Chat messaging
  const handleSendMessage = async (text: string) => {
    if (!studentId || !profile || !fullData) return;
    const studentDocRef = doc(db, "students", studentId);

    const userMsg: MentorMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      sender: "user",
      text: text,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = fullData.messages || [];
    const updatedMessages = [...currentMessages, userMsg];

    setFullData((prev) => {
      if (!prev) return prev;
      return { ...prev, messages: updatedMessages };
    });
    setActionLoading(true);

    try {
      const aiResponse = await sendMentorMessage(profile, currentMessages, text);

      const aiMsg: MentorMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 11),
        sender: "ai",
        text: aiResponse.text || "I was unable to synthesize a response at this time. Please check your Digital Twin skills registry.",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setFullData((prev) => {
        if (!prev) return prev;
        return { ...prev, messages: finalMessages };
      });

      try {
        await updateDoc(studentDocRef, { messages: finalMessages });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshAnalyticsOnly = async () => {
    if (!studentId || !profile || !fullData) return;
    setActionLoading(true);
    try {
      const analyticsRes = await generateAnalytics(profile, {
        roadmap: fullData.roadmap,
        studyPlan: fullData.studyPlan,
        projectMentor: fullData.projectMentor,
        resumeAnalysis: fullData.resumeAnalysis,
        skillGap: fullData.skillGap,
      });

      const analytics: DashboardAnalytics = {
        placementReadinessScore: analyticsRes.placementReadinessScore,
        skillsProgress: analyticsRes.skillsProgress,
        learningProgress: analyticsRes.learningProgress,
        roadmapCompletion: analyticsRes.roadmapCompletion,
        resumeScore: analyticsRes.resumeScore,
        skillGapScore: analyticsRes.skillGapScore,
        aiInsights: analyticsRes.aiInsights,
        recentRecommendations: analyticsRes.recentRecommendations,
        lastUpdated: new Date().toISOString(),
      };

      try {
        await updateDoc(doc(db, "students", studentId), { analytics });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
      }
      setFullData((prev) => {
        if (!prev) return prev;
        return { ...prev, analytics };
      });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("careercompass_student_id");
    setStudentId(null);
    setProfile(null);
    setFullData(null);
    setView("dashboard");
  };

  // Render Loading Splash Screen
  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-mono text-slate-500">Initializing Cognition Engine...</span>
      </div>
    );
  }

  // Render Landing Page
  if (!studentId || !profile || !fullData) {
    return <LandingPage onStart={handleOnboarding} />;
  }

  // Render Dashboard Workspace layout
  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col lg:flex-row relative">
      <Sidebar
        currentView={currentView}
        setView={setView}
        profile={profile}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 overflow-y-auto h-screen p-4 sm:p-6 lg:p-8">
        {currentView === "dashboard" && (
          <DashboardView
            profile={profile}
            analytics={fullData.analytics || null}
            setView={setView}
            onRefreshAnalytics={handleRefreshAnalyticsOnly}
            loading={actionLoading}
          />
        )}

        {currentView === "digital-twin" && (
          <TwinView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onTriggerRecalculateAllAgents={handleTriggerRecalculateAllAgents}
          />
        )}

        {currentView === "mentor-hub" && (
          <MentorHubView
            profile={profile}
            messages={fullData.messages || []}
            onSendMessage={handleSendMessage}
            loading={actionLoading}
          />
        )}

        {currentView === "learning-coach" && (
          <LearningCoachView
            profile={profile}
            studyPlan={fullData.studyPlan || null}
            onGeneratePlan={async () => {
              setActionLoading(true);
              try {
                const res = await generateLearningPlan(profile);
                const updatedPlan: StudyPlan = {
                  dailyPlan: res.dailyPlan,
                  weeklyGoal: res.weeklyGoal,
                  tips: res.tips,
                  lastUpdated: new Date().toISOString(),
                };
                await updateDoc(doc(db, "students", studentId), { studyPlan: updatedPlan });
                setFullData((prev) => prev ? { ...prev, studyPlan: updatedPlan } : prev);
              } catch (e) {
                console.error(e);
              } finally {
                setActionLoading(false);
              }
            }}
            onToggleTopic={handleToggleTopic}
            loading={actionLoading}
          />
        )}

        {currentView === "project-mentor" && (
          <ProjectMentorView
            profile={profile}
            projectsData={fullData.projectMentor || null}
            onGenerateProjects={async () => {
              setActionLoading(true);
              try {
                const res = await generateProjects(profile);
                const updatedData: ProjectMentorData = {
                  studentId: profile.id,
                  projects: res.projects,
                  lastUpdated: new Date().toISOString(),
                };
                await updateDoc(doc(db, "students", studentId), { projectMentor: updatedData });
                setFullData((prev) => prev ? { ...prev, projectMentor: updatedData } : prev);
              } catch (e) {
                console.error(e);
              } finally {
                setActionLoading(false);
              }
            }}
            loading={actionLoading}
          />
        )}

        {currentView === "roadmap-generator" && (
          <RoadmapView
            profile={profile}
            roadmap={fullData.roadmap || null}
            onGenerateRoadmap={async () => {
              setActionLoading(true);
              try {
                const res = await generateRoadmap(profile);
                const updatedRoadmap: RoadmapData = {
                  studentId: profile.id,
                  semesters: res.semesters,
                  lastUpdated: new Date().toISOString(),
                };
                await updateDoc(doc(db, "students", studentId), { roadmap: updatedRoadmap });
                setFullData((prev) => prev ? { ...prev, roadmap: updatedRoadmap } : prev);
              } catch (e) {
                console.error(e);
              } finally {
                setActionLoading(false);
              }
            }}
            loading={actionLoading}
          />
        )}

        {currentView === "resume-analyzer" && (
          <ResumeAnalyzerView
            profile={profile}
            resumeAnalysis={fullData.resumeAnalysis || null}
            onAnalyzeResume={async () => {
              setActionLoading(true);
              try {
                const res = await analyzeProfileResume(profile);
                const updatedAnalysis: ResumeAnalysisData = {
                  atsScore: res.atsScore,
                  skillsFeedback: res.skillsFeedback,
                  projectsFeedback: res.projectsFeedback,
                  formattingFeedback: res.formattingFeedback,
                  keywordSuggestions: res.keywordSuggestions,
                  achievementsFeedback: res.achievementsFeedback,
                  improvements: res.improvements,
                  generatedRawResume: res.generatedRawResume || "",
                  lastUpdated: new Date().toISOString(),
                };
                await updateDoc(doc(db, "students", studentId), { resumeAnalysis: updatedAnalysis });
                setFullData((prev) => prev ? { ...prev, resumeAnalysis: updatedAnalysis } : prev);
              } catch (e) {
                console.error(e);
              } finally {
                setActionLoading(false);
              }
            }}
            loading={actionLoading}
          />
        )}

        {currentView === "skill-gap-analyzer" && (
          <SkillGapView
            profile={profile}
            skillGap={fullData.skillGap || null}
            onAnalyzeGap={async () => {
              setActionLoading(true);
              try {
                const res = await analyzeSkillGap(profile);
                const updatedGap: SkillGapData = {
                  dreamRole: profile.careerGoal,
                  currentSkills: res.currentSkills,
                  missingSkills: res.missingSkills,
                  skillMatchPercentage: res.skillMatchPercentage,
                  priorityLearningOrder: res.priorityLearningOrder,
                  estimatedWeeksToReady: res.estimatedWeeksToReady,
                  improvementPlan: res.improvementPlan,
                  lastUpdated: new Date().toISOString(),
                };
                await updateDoc(doc(db, "students", studentId), { skillGap: updatedGap });
                setFullData((prev) => prev ? { ...prev, skillGap: updatedGap } : prev);
              } catch (e) {
                console.error(e);
              } finally {
                setActionLoading(false);
              }
            }}
            loading={actionLoading}
          />
        )}

        {currentView === "analytics" && (
          <AnalyticsView
            profile={profile}
            analytics={fullData.analytics || null}
          />
        )}

        {currentView === "settings" && (
          <SettingsView
            profile={profile}
            onClearSession={handleLogout}
            onReinitializeAllMemory={handleTriggerRecalculateAllAgents}
            loading={actionLoading}
          />
        )}
      </main>
    </div>
  );
}
