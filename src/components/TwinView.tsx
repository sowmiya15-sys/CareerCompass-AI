/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  StudentProfile,
  CompleteStudentData
} from "../types";
import {
  Save,
  FileText,
  Upload,
  Link2,
  Github,
  Linkedin,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  ListPlus,
  Loader2,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { analyzeResume } from "../lib/api";

interface TwinViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onTriggerRecalculateAllAgents: () => Promise<void>;
}

export default function TwinView({
  profile,
  onUpdateProfile,
  onTriggerRecalculateAllAgents,
}: TwinViewProps) {
  const [cgpa, setCgpa] = useState(profile.cgpa || 0);
  const [dailyHours, setDailyHours] = useState(profile.dailyStudyHours || 2);
  const [learningStyle, setLearningStyle] = useState(profile.preferredLearningStyle || "Practical");
  const [github, setGithub] = useState(profile.githubProfile || "");
  const [linkedin, setLinkedin] = useState(profile.linkedinProfile || "");
  const [pastedResume, setPastedResume] = useState(profile.resumeText || "");

  // Tag inputs
  const [skillsStr, setSkillsStr] = useState(profile.skills?.join(", ") || "");
  const [languagesStr, setLanguagesStr] = useState(profile.languages?.join(", ") || "");
  const [frameworksStr, setFrameworksStr] = useState(profile.frameworks?.join(", ") || "");
  const [interestsStr, setInterestsStr] = useState(profile.interests?.join(", ") || "");

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleProfileSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const skills = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
      const languages = languagesStr.split(",").map((s) => s.trim()).filter(Boolean);
      const frameworks = frameworksStr.split(",").map((s) => s.trim()).filter(Boolean);
      const interests = interestsStr.split(",").map((s) => s.trim()).filter(Boolean);

      await onUpdateProfile({
        cgpa: Number(cgpa),
        dailyStudyHours: Number(dailyHours),
        preferredLearningStyle: learningStyle,
        githubProfile: github,
        linkedinProfile: linkedin,
        resumeText: pastedResume,
        skills,
        languages,
        frameworks,
        interests,
      });

      setSuccessMsg("Digital Twin memory updated successfully!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update Digital Twin.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!validTypes.includes(selected.type)) {
      setErrorMsg("Invalid file type. Please upload PDF, DOCX, PNG, JPG, or JPEG.");
      return;
    }

    setFile(selected);
    setUploading(true);
    setSuccessMsg("");
    setErrorMsg("");
    setUploadProgress("Uploading file to secure Cloud Storage...");

    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `resumes/${profile.id}/${selected.name}`);
      await uploadBytes(storageRef, selected);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Read base64 to send to our OCR analysis endpoint
      setUploadProgress("Deconstructing resume via Gemini Vision/OCR Core...");
      const reader = new FileReader();
      reader.readAsDataURL(selected);
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const extracted = await analyzeResume({
            fileBase64: base64,
            mimeType: selected.type,
            fileName: selected.name,
          });

          // 3. Update Twin with extracted information
          await onUpdateProfile({
            resumeUrl: downloadUrl,
            resumeFileName: selected.name,
            resumeText: extracted.resumeText || "",
            cgpa: extracted.cgpa || cgpa,
            skills: extracted.skills && extracted.skills.length ? extracted.skills : profile.skills,
            languages: extracted.languages && extracted.languages.length ? extracted.languages : profile.languages,
            frameworks: extracted.frameworks && extracted.frameworks.length ? extracted.frameworks : profile.frameworks,
            interests: extracted.interests && extracted.interests.length ? extracted.interests : profile.interests,
            preferredLearningStyle: extracted.preferredLearningStyle || learningStyle,
            githubProfile: extracted.githubProfile || github,
            linkedinProfile: extracted.linkedinProfile || linkedin,
          });

          // Sync local state inputs
          if (extracted.cgpa) setCgpa(extracted.cgpa);
          if (extracted.skills) setSkillsStr(extracted.skills.join(", "));
          if (extracted.languages) setLanguagesStr(extracted.languages.join(", "));
          if (extracted.frameworks) setFrameworksStr(extracted.frameworks.join(", "));
          if (extracted.interests) setInterestsStr(extracted.interests.join(", "));
          if (extracted.preferredLearningStyle) setLearningStyle(extracted.preferredLearningStyle);
          if (extracted.githubProfile) setGithub(extracted.githubProfile);
          if (extracted.linkedinProfile) setLinkedin(extracted.linkedinProfile);
          if (extracted.resumeText) setPastedResume(extracted.resumeText);

          setSuccessMsg(`Successfully parsed "${selected.name}" and merged profile memory!`);
          setUploading(false);
          setFile(null);
        } catch (err: any) {
          console.error(err);
          setErrorMsg(`Upload succeeded, but AI extraction failed: ${err.message}`);
          setUploading(false);
        }
      };
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to upload resume.");
      setUploading(false);
    }
  };

  const handlePasteResumeAnalysis = async () => {
    if (!pastedResume.trim()) {
      setErrorMsg("Please paste your resume text first.");
      return;
    }
    setUploading(true);
    setSuccessMsg("");
    setErrorMsg("");
    setUploadProgress("Analyzing pasted resume text via Cognitive Agent...");

    try {
      const extracted = await analyzeResume({ resumeText: pastedResume });

      await onUpdateProfile({
        resumeText: pastedResume,
        cgpa: extracted.cgpa || cgpa,
        skills: extracted.skills && extracted.skills.length ? extracted.skills : profile.skills,
        languages: extracted.languages && extracted.languages.length ? extracted.languages : profile.languages,
        frameworks: extracted.frameworks && extracted.frameworks.length ? extracted.frameworks : profile.frameworks,
        interests: extracted.interests && extracted.interests.length ? extracted.interests : profile.interests,
        preferredLearningStyle: extracted.preferredLearningStyle || learningStyle,
        githubProfile: extracted.githubProfile || github,
        linkedinProfile: extracted.linkedinProfile || linkedin,
      });

      if (extracted.cgpa) setCgpa(extracted.cgpa);
      if (extracted.skills) setSkillsStr(extracted.skills.join(", "));
      if (extracted.languages) setLanguagesStr(extracted.languages.join(", "));
      if (extracted.frameworks) setFrameworksStr(extracted.frameworks.join(", "));
      if (extracted.interests) setInterestsStr(extracted.interests.join(", "));
      if (extracted.preferredLearningStyle) setLearningStyle(extracted.preferredLearningStyle);
      if (extracted.githubProfile) setGithub(extracted.githubProfile);
      if (extracted.linkedinProfile) setLinkedin(extracted.linkedinProfile);

      setSuccessMsg("Pasted resume text successfully analyzed and merged!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze pasted resume.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Student Digital Twin</h1>
            <p className="text-xs text-slate-400">
              The common memory layer which holds your skills, records, and preferences. Updated dynamically.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleProfileSave}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 active:scale-98 shadow-lg shadow-blue-500/15"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Memory</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <Award className="w-5 h-5 flex-shrink-0 rotate-180" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Core Identity (Static / Pre-set) */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              Core Identity
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500">Full Name</label>
                <p className="text-sm font-semibold text-white">{profile.fullName}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500">Branch & Dept</label>
                <p className="text-sm font-semibold text-white">{profile.branch}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-500">Academic Year</label>
                  <p className="text-sm font-semibold text-white">{profile.academicYear}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-500">Current Semester</label>
                  <p className="text-sm font-semibold text-white">{profile.semester}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500">Career Goal</label>
                <p className="text-sm font-semibold text-blue-400">{profile.careerGoal}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <Clock className="w-4 h-4 text-blue-400" />
              Metrics & Styles
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Current CGPA (0.0 - 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 glass-input transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Daily Study Target (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 glass-input transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Preferred Learning Style</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 bg-slate-900 border border-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Visual">Visual (Videos, Charts)</option>
                  <option value="Practical">Practical (Projects, Code)</option>
                  <option value="Theoretical">Theoretical (Books, Math)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Skills, Languages & Frameworks */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <ListPlus className="w-4 h-4 text-blue-400" />
              Skill Registry (Comma Separated)
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Programming Languages</label>
                <input
                  type="text"
                  placeholder="e.g. JavaScript, Python, C++, Go"
                  value={languagesStr}
                  onChange={(e) => setLanguagesStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200 glass-input transition-all duration-200"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {languagesStr.split(",").map((s) => s.trim()).filter(Boolean).map((lang, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Frameworks / Libraries</label>
                <input
                  type="text"
                  placeholder="e.g. React, Express, Node.js, PyTorch"
                  value={frameworksStr}
                  onChange={(e) => setFrameworksStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200 glass-input transition-all duration-200"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {frameworksStr.split(",").map((s) => s.trim()).filter(Boolean).map((fw, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400">
                      {fw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Technical Skills & Tools</label>
                <input
                  type="text"
                  placeholder="e.g. Git, Docker, Kubernetes, AWS, SQL"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200 glass-input transition-all duration-200"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skillsStr.split(",").map((s) => s.trim()).filter(Boolean).map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] text-sky-400">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Domains of Interest</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Web Development, DevOps"
                  value={interestsStr}
                  onChange={(e) => setInterestsStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-200 glass-input transition-all duration-200"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interestsStr.split(",").map((s) => s.trim()).filter(Boolean).map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-500/15 border border-slate-700 text-[10px] text-slate-400">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/40">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Github className="w-4 h-4 text-slate-400" />
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 glass-input transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 glass-input transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Management / Upload and Parsing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Resume File */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800/60">
            <Upload className="w-4 h-4 text-blue-400" />
            Resume Upload (PDF, DOCX, PNG, JPG, JPEG)
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-blue-500/40 transition-all duration-200 rounded-xl p-8 bg-slate-900/40 relative cursor-pointer group">
              <input
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:pointer-events-none"
              />
              <FileText className="w-10 h-10 text-slate-500 group-hover:text-blue-400 transition-colors mb-3 animate-bounce-slow" />
              <p className="text-xs font-medium text-slate-300">
                Drag and drop your file here, or <span className="text-blue-500">browse</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, PNG, JPG up to 10MB</p>
            </div>

            {uploading && (
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>{uploadProgress}</span>
              </div>
            )}

            {profile.resumeFileName ? (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{profile.resumeFileName}</div>
                    <div className="text-[10px] text-slate-500">Linked to Cloud Storage</div>
                  </div>
                </div>
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex-shrink-0"
                  >
                    <Link2 className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center">No resume uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Paste Resume Text */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              Paste Resume Text (Alternative)
            </h2>

            <textarea
              placeholder="Paste your raw resume text here to analyze skills, education, and experience..."
              value={pastedResume}
              onChange={(e) => setPastedResume(e.target.value)}
              className="w-full h-32 p-3 rounded-lg text-xs text-slate-300 glass-input transition-all duration-200 font-mono resize-none focus:outline-none"
            />
          </div>

          <button
            onClick={handlePasteResumeAnalysis}
            disabled={uploading || !pastedResume.trim()}
            className="w-full mt-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse pasted text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recalculate/Sync Agent memory button */}
      <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-center flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h3 className="text-xs font-semibold text-white">Need to refresh career plans?</h3>
          <p className="text-[10px] text-slate-400">
            Clicking this will force all agents (Roadmap, Learning Coach, Project Mentor, Skill Gap, and Resume Analyzer) to re-evaluate your updated profile data.
          </p>
        </div>
        <button
          onClick={onTriggerRecalculateAllAgents}
          disabled={uploading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-medium hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md active:scale-98"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-spin-slow" />
          <span>Synchronize Agent Core</span>
        </button>
      </div>
    </div>
  );
}
