/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  StudentProfile,
  SkillGapData
} from "../types";
import {
  Target,
  Sparkles,
  Loader2,
  TrendingUp,
  XCircle,
  CheckCircle,
  Clock,
  Compass,
  AlertCircle
} from "lucide-react";

interface SkillGapViewProps {
  profile: StudentProfile;
  skillGap: SkillGapData | null;
  onAnalyzeGap: () => Promise<void>;
  loading: boolean;
}

export default function SkillGapView({
  profile,
  skillGap,
  onAnalyzeGap,
  loading,
}: SkillGapViewProps) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Target className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">AI Skill Gap Analyzer</h1>
            <p className="text-xs text-slate-400">
              Evaluates your digital twin skills registry against core industry competencies for your dream role as a <span className="text-blue-400 font-semibold">{profile.careerGoal}</span>.
            </p>
          </div>
        </div>

        <button
          onClick={onAnalyzeGap}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Analyzing Gap...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{skillGap ? "Re-run Diagnostic" : "Run Skill Gap Diagnostic"}</span>
            </>
          )}
        </button>
      </div>

      {!skillGap ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 mx-auto">
            <Target className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-display font-bold text-white">Compare Against Target Role</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Skill Gap Agent will crawl requirements for a "{profile.careerGoal}" role and calculate your matching coefficient, identify critical missing tools, and project your placement-ready timeline.
            </p>
          </div>
          <button
            onClick={onAnalyzeGap}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl transition-all hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Running diagnostic sweeps...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Trigger Skill Comparison</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Diagnostic Content */
        <div className="space-y-8">
          {/* Top Row: Match index and time estimation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Match percentage */}
            <div className="md:col-span-1 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-6">
                Dream Role Match Coefficient
              </h3>

              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-blue-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - skillGap.skillMatchPercentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-3xl font-display font-extrabold text-white">
                  {skillGap.skillMatchPercentage}%
                </span>
              </div>

              <div className="text-[10px] font-mono uppercase px-2 py-1 bg-slate-900 rounded tracking-wider text-blue-400">
                {skillGap.skillMatchPercentage >= 75 ? "Placement Prime" : skillGap.skillMatchPercentage >= 50 ? "Skill Gaps Present" : "Critical gaps detected"}
              </div>
            </div>

            {/* Preparation Timeline */}
            <div className="md:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Estimated Time to Become Placement-Ready
                </h3>

                <div className="flex items-center gap-4 py-2">
                  <div className="text-4xl sm:text-5xl font-display font-extrabold text-indigo-400">
                    {skillGap.estimatedWeeksToReady}{" "}
                    <span className="text-sm font-sans font-normal text-slate-400">weeks</span>
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    Assuming consistency with your target of <span className="text-white font-semibold">{profile.dailyStudyHours} hours</span> daily under a <span className="text-white font-semibold">{profile.preferredLearningStyle}</span> curriculum strategy.
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-4 border-t border-slate-900/60">
                <AlertCircle className="w-3.5 h-3.5" />
                Index based on global tech hiring benchmarks for Junior {profile.careerGoal} roles.
              </p>
            </div>
          </div>

          {/* Current vs Missing Skills Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Stack match */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                Matched Skills Registry
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGap.currentSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  >
                    ✓ {skill}
                  </span>
                ))}
                {(!skillGap.currentSkills || skillGap.currentSkills.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No matching target skills detected in twin memory.</p>
                )}
              </div>
            </div>

            {/* Critical Missing skills */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
                <XCircle className="w-4.5 h-4.5 text-red-400" />
                Identified Competency Gaps
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGap.missingSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse"
                  >
                    ! {skill}
                  </span>
                ))}
                {(!skillGap.missingSkills || skillGap.missingSkills.length === 0) && (
                  <p className="text-xs text-emerald-400 italic">Perfect fit! No competency gaps found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Learning Priority order */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60">
              Optimal Placement Priority Learning Order
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skillGap.priorityLearningOrder?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.skill}</span>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                      item.priority === "High"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : item.priority === "Medium"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-700"
                    }`}>
                      {item.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Step-by-Step improvement plan */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
              Strategic Portfolio Recovery Plan
            </h3>

            <div className="space-y-3">
              {skillGap.improvementPlan?.map((step, idx) => (
                <div key={idx} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="mt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
