/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  StudentProfile,
  ResumeAnalysisData
} from "../types";
import {
  FileSearch,
  Sparkles,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Copy,
  ChevronRight,
  TrendingUp,
  Download
} from "lucide-react";

interface ResumeAnalyzerViewProps {
  profile: StudentProfile;
  resumeAnalysis: ResumeAnalysisData | null;
  onAnalyzeResume: () => Promise<void>;
  loading: boolean;
}

export default function ResumeAnalyzerView({
  profile,
  resumeAnalysis,
  onAnalyzeResume,
  loading,
}: ResumeAnalyzerViewProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyResume = () => {
    if (!resumeAnalysis?.generatedRawResume) return;
    navigator.clipboard.writeText(resumeAnalysis.generatedRawResume);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileSearch className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">AI Resume Analyzer</h1>
            <p className="text-xs text-slate-400">
              Evaluates your resume against Applicant Tracking Systems (ATS) and professional developer guidelines.
            </p>
          </div>
        </div>

        <button
          onClick={onAnalyzeResume}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{resumeAnalysis ? "Re-run ATS Scan" : "Perform ATS Audit"}</span>
            </>
          )}
        </button>
      </div>

      {!resumeAnalysis ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 mx-auto">
            <FileText className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-display font-bold text-white">Perform Initial ATS Audit</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {profile.resumeFileName
                ? `Ready to scan your uploaded resume "${profile.resumeFileName}".`
                : "No resume uploaded. Our Resume Agent will automatically construct a master markdown resume from your Digital Twin and run diagnostics on that!"}
            </p>
          </div>
          <button
            onClick={onAnalyzeResume}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl transition-all hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Generating and analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Begin Scanning Diagnostic</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Diagnostic Content */
        <div className="space-y-8">
          {/* Top Row: Score card & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ATS Score card */}
            <div className="md:col-span-1 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-6">
                Calculated ATS Score
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
                    className="stroke-indigo-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - resumeAnalysis.atsScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-3xl font-display font-extrabold text-white">
                  {resumeAnalysis.atsScore}
                </span>
              </div>

              <div className="text-[10px] font-mono uppercase px-2 py-1 bg-slate-900 rounded tracking-wider text-indigo-400">
                {resumeAnalysis.atsScore >= 80 ? "Highly Ready" : resumeAnalysis.atsScore >= 60 ? "Average Strength" : "Requires Revisions"}
              </div>
            </div>

            {/* Keyword Optimization & Improvements Summary */}
            <div className="md:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60">
                Critical Keywords for ATS Parsing
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {resumeAnalysis.keywordSuggestions?.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400"
                  >
                    + {keyword}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic mt-2">
                Integrating these industry keywords into your projects and profile description raises ATS search indexing by up to 40%.
              </p>
            </div>
          </div>

          {/* Detailed Audits Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills & Projects Feedback */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60">
                Skills & Experience Analysis
              </h3>
              <div className="space-y-3.5">
                {resumeAnalysis.skillsFeedback?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    {item.status === "good" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : item.status === "needs_improvement" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className={`font-semibold mr-1.5 uppercase text-[9px] px-1 py-0.5 rounded ${
                        item.status === "good" ? "bg-emerald-500/10 text-emerald-400" : item.status === "needs_improvement" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {item.status === "good" ? "Aligned" : item.status === "needs_improvement" ? "Optimize" : "Missing"}
                      </span>
                      <p className="text-slate-300 mt-1.5 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout, Achievements, Formatting */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60">
                Format, Layout & Accomplishments
              </h3>
              <div className="space-y-4 text-xs">
                {/* Formatting */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Formatting & Readability</div>
                  {resumeAnalysis.formattingFeedback?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Achievements */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Quantifiable Achievements</div>
                  {resumeAnalysis.achievementsFeedback?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Improvements Roadmap */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
              Actionable Improvement Plan
            </h3>
            <div className="space-y-3">
              {resumeAnalysis.improvements?.map((imp, idx) => (
                <div key={idx} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="mt-0.5">{imp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Master Resume section */}
          {resumeAnalysis.generatedRawResume && (
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-blue-400" />
                    AI Generated Master Markdown Resume
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    No uploaded resume found. Built from your Student Digital Twin memory.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResume}
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copySuccess ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#030712] border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {resumeAnalysis.generatedRawResume}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
