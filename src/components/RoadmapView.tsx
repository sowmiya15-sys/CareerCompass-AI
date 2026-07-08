/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  StudentProfile,
  RoadmapData
} from "../types";
import {
  Map,
  Sparkles,
  Loader2,
  Calendar,
  Book,
  Code,
  Cloud,
  FolderOpen,
  Award,
  Users
} from "lucide-react";

interface RoadmapViewProps {
  profile: StudentProfile;
  roadmap: RoadmapData | null;
  onGenerateRoadmap: () => Promise<void>;
  loading: boolean;
}

export default function RoadmapView({
  profile,
  roadmap,
  onGenerateRoadmap,
  loading,
}: RoadmapViewProps) {
  const [activeSem, setActiveSem] = useState<number>(0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Map className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">AI Roadmap Generator</h1>
            <p className="text-xs text-slate-400">
              Your customized, semester-by-semester curriculum to secure your target role as a <span className="text-blue-400 font-semibold">{profile.careerGoal}</span>.
            </p>
          </div>
        </div>

        {roadmap && (
          <button
            onClick={onGenerateRoadmap}
            disabled={loading}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 text-xs font-semibold rounded-xl text-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-400" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
            <span>Regenerate Roadmap</span>
          </button>
        )}
      </div>

      {/* No Roadmap State */}
      {!roadmap ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 mx-auto">
            <Map className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-display font-bold text-white">Unlock Your Career Roadmap</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Roadmap Agent needs to synthesize your branch details, skillset registry, preferred learning styles, and career goals to blueprint a custom placement path.
            </p>
          </div>
          <button
            onClick={onGenerateRoadmap}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl transition-all hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Roadmap Agent formulating plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Formulate Academic Career Roadmap</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Roadmap Content */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Semester Sidebar Selection */}
          <div className="md:col-span-1 space-y-2">
            <label className="text-[10px] uppercase font-mono text-slate-500 px-1">Curriculum Milestones</label>
            <div className="space-y-1.5">
              {roadmap.semesters?.map((sem, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSem(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium border transition-all ${
                    activeSem === idx
                      ? "bg-blue-600/15 border-blue-500/30 text-blue-400 font-semibold"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{sem.semester}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Semester Detailed Content */}
          <div className="md:col-span-3 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                <h2 className="text-base font-display font-bold text-white flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  {roadmap.semesters?.[activeSem]?.semester} Focus Areas
                </h2>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                  Target: {profile.careerGoal}
                </span>
              </div>

              {/* Bento Grid inside Active Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Programming Languages */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <h3 className="text-xs font-semibold text-blue-400 flex items-center gap-2">
                    <Code className="w-4.5 h-4.5" />
                    Languages & Tools
                  </h3>
                  <ul className="space-y-1.5">
                    {roadmap.semesters?.[activeSem]?.programmingLanguages?.map((lang, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{lang}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data Structures & Algorithms */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <h3 className="text-xs font-semibold text-indigo-400 flex items-center gap-2">
                    <Book className="w-4.5 h-4.5" />
                    DSA & Computer Science Core
                  </h3>
                  <ul className="space-y-1.5">
                    {roadmap.semesters?.[activeSem]?.dsa?.map((item, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Development Stacks */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <h3 className="text-xs font-semibold text-sky-400 flex items-center gap-2">
                    <FolderOpen className="w-4.5 h-4.5" />
                    Application Development
                  </h3>
                  <ul className="space-y-1.5">
                    {roadmap.semesters?.[activeSem]?.development?.map((item, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI and Cloud Infrastructure */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <h3 className="text-xs font-semibold text-purple-400 flex items-center gap-2">
                    <Cloud className="w-4.5 h-4.5" />
                    AI & Cloud Computing
                  </h3>
                  <ul className="space-y-1.5">
                    {roadmap.semesters?.[activeSem]?.aiAndCloud?.map((item, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Projects, Certifications & Interview Prep Bottom Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800/60">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Recommended Semester Projects */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5" />
                      Milestone Projects
                    </h4>
                    <ul className="space-y-1.5">
                      {roadmap.semesters?.[activeSem]?.projects?.map((p, i) => (
                        <li key={i} className="text-xs font-medium text-white">
                          • {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Certificates & Courses
                    </h4>
                    <ul className="space-y-1.5">
                      {roadmap.semesters?.[activeSem]?.certifications?.map((c, i) => (
                        <li key={i} className="text-xs text-slate-300">
                          • {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interview Preparation */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Interview Prep & Soft Skills
                    </h4>
                    <ul className="space-y-1.5">
                      {roadmap.semesters?.[activeSem]?.interviewPrep?.map((ip, i) => (
                        <li key={i} className="text-xs text-slate-300">
                          • {ip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
