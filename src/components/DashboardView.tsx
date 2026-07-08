/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  StudentProfile,
  DashboardAnalytics
} from "../types";
import {
  Sparkles,
  TrendingUp,
  BrainCircuit,
  FileText,
  MapPin,
  CheckCircle,
  Lightbulb,
  ArrowUpRight,
  ShieldCheck,
  Target
} from "lucide-react";

interface DashboardViewProps {
  profile: StudentProfile;
  analytics: DashboardAnalytics | null;
  setView: (view: any) => void;
  onRefreshAnalytics: () => Promise<void>;
  loading: boolean;
}

export default function DashboardView({
  profile,
  analytics,
  setView,
  onRefreshAnalytics,
  loading,
}: DashboardViewProps) {
  const defaultAnalytics: DashboardAnalytics = {
    placementReadinessScore: 45,
    skillsProgress: 35,
    learningProgress: 20,
    roadmapCompletion: 15,
    resumeScore: 10,
    skillGapScore: 30,
    aiInsights: [
      "Your Digital Twin is successfully initialized! Set up your resume or input skills to generate tailored insight pipelines.",
      "Complete your skills list in the 'Student Digital Twin' tab to unlock deep placement-readiness scoring.",
      "Your agents are waiting for memory synchronization. Force calculate below to run initial diagnostics."
    ],
    recentRecommendations: [
      "Complete and upload your latest resume file to calculate ATS feedback.",
      "Update daily study hours and style for a personalized learning roadmap.",
      "Trigger 'Synchronize Agent Core' to update your agent insights."
    ],
    lastUpdated: new Date().toISOString(),
  };

  const data = analytics || defaultAnalytics;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-extrabold text-white">
              Hello, {profile.fullName}
            </h1>
            <ShieldCheck className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Student Digital Twin is online. Department of <span className="text-blue-400 font-semibold">{profile.branch}</span> • {profile.academicYear} • {profile.semester}
          </p>
        </div>

        <button
          onClick={onRefreshAnalytics}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Recalculating Scores...</span>
            </>
          ) : (
            <>
              <BrainCircuit className="w-4 h-4 animate-spin-slow" />
              <span>Refresh AI Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {/* Main Placement Readiness Circular Card / Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Core Metric */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-t from-blue-500/5 to-transparent pointer-events-none" />
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-500" />
            Placement Readiness Index
          </h2>

          <div className="relative flex items-center justify-center w-36 h-36">
            {/* Circular progress track */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-blue-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 62}
                strokeDashoffset={2 * Math.PI * 62 * (1 - data.placementReadinessScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-extrabold text-white">{data.placementReadinessScore}%</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Overall index</span>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-400 max-w-[200px] leading-relaxed">
            Target role: <span className="text-blue-400 font-semibold">{profile.careerGoal}</span>
          </div>
        </div>

        {/* Diagnostic Parameter Metrics */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-5">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Core Analytics Radar Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Parameters */}
            {[
              { label: "Skills Registry Progress", value: data.skillsProgress, color: "from-blue-500 to-sky-400", view: "digital-twin" },
              { label: "Roadmap Milestones", value: data.roadmapCompletion, color: "from-indigo-500 to-purple-400", view: "roadmap-generator" },
              { label: "Learning Target Progress", value: data.learningProgress, color: "from-emerald-500 to-teal-400", view: "learning-coach" },
              { label: "ATS Resume Feedback", value: data.resumeScore, color: "from-blue-600 to-indigo-500", view: "resume-analyzer" },
              { label: "Dream Role Match %", value: data.skillGapScore, color: "from-sky-500 to-blue-400", view: "skill-gap-analyzer" },
            ].map((param, index) => (
              <div
                key={index}
                onClick={() => setView(param.view)}
                className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-blue-500/20 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
                    {param.label}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${param.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${param.value}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-white w-8 text-right">
                    {param.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Synthesized Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cognitive AI Insights */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
            <Lightbulb className="w-4.5 h-4.5 text-amber-400" />
            Synthesized AI Insights
          </h2>

          <div className="space-y-3.5">
            {data.aiInsights?.map((insight, idx) => (
              <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                <span className="text-amber-400 font-bold select-none">•</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Items */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
            AI Recommended Actions
          </h2>

          <div className="space-y-3.5">
            {data.recentRecommendations?.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="mt-0.5">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
