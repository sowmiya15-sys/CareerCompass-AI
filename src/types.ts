/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfile {
  id: string;
  fullName: string;
  branch: string;
  academicYear: string; // e.g. "Year 1", "Year 2", etc.
  semester: string; // e.g. "Semester 1", "Semester 2", etc.
  careerGoal: string; // e.g. "Software Engineer"
  cgpa: number;
  skills: string[];
  languages: string[];
  frameworks: string[];
  interests: string[];
  dailyStudyHours: number;
  preferredLearningStyle: string; // e.g. "Visual", "Practical", "Theoretical"
  githubProfile: string;
  linkedinProfile: string;
  resumeText: string;
  resumeUrl: string;
  resumeFileName: string;
}

export interface RoadmapSemester {
  semester: string;
  programmingLanguages: string[];
  dsa: string[];
  development: string[];
  aiAndCloud: string[];
  projects: string[];
  certifications: string[];
  interviewPrep: string[];
}

export interface RoadmapData {
  studentId: string;
  semesters: RoadmapSemester[];
  lastUpdated: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  duration: string; // e.g. "2 hours"
  completed: boolean;
  day: string; // e.g. "Monday", "Week 1"
}

export interface StudyPlan {
  dailyPlan: {
    day: string;
    topics: StudyTopic[];
    revisionSchedule: string;
  }[];
  weeklyGoal: string;
  tips: string[];
  lastUpdated: string;
}

export interface ProjectSuggestion {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  techStack: string[];
  architecture: string;
  apis: string[];
  implementationSteps: string[];
  learningOutcomes: string[];
}

export interface ProjectMentorData {
  studentId: string;
  projects: ProjectSuggestion[];
  lastUpdated: string;
}

export interface ResumeAnalysisData {
  atsScore: number;
  skillsFeedback: { status: "good" | "needs_improvement" | "missing"; detail: string }[];
  projectsFeedback: string[];
  formattingFeedback: string[];
  keywordSuggestions: string[];
  achievementsFeedback: string[];
  improvements: string[];
  generatedRawResume?: string; // markdown or text representation if generated
  lastUpdated: string;
}

export interface SkillGapData {
  dreamRole: string;
  currentSkills: string[];
  missingSkills: string[];
  skillMatchPercentage: number;
  priorityLearningOrder: { skill: string; priority: "High" | "Medium" | "Low"; reason: string }[];
  estimatedWeeksToReady: number;
  improvementPlan: string[];
  lastUpdated: string;
}

export interface DashboardAnalytics {
  placementReadinessScore: number;
  skillsProgress: number; // 0-100
  learningProgress: number; // 0-100
  roadmapCompletion: number; // 0-100
  resumeScore: number; // 0-100
  skillGapScore: number; // 0-100
  aiInsights: string[];
  recentRecommendations: string[];
  lastUpdated: string;
}

export interface MentorMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface CompleteStudentData {
  profile: StudentProfile;
  roadmap?: RoadmapData;
  studyPlan?: StudyPlan;
  projectMentor?: ProjectMentorData;
  resumeAnalysis?: ResumeAnalysisData;
  skillGap?: SkillGapData;
  analytics?: DashboardAnalytics;
  messages?: MentorMessage[];
}
