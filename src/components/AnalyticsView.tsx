/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  StudentProfile,
  DashboardAnalytics
} from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { TrendingUp, Award, Target, FileText, CheckCircle2 } from "lucide-react";

interface AnalyticsViewProps {
  profile: StudentProfile;
  analytics: DashboardAnalytics | null;
}

export default function AnalyticsView({ profile, analytics }: AnalyticsViewProps) {
  // Mock data points based on profile and actual analytics to show nice dynamic charts
  const readiness = analytics?.placementReadinessScore || 45;
  const skillsProgress = analytics?.skillsProgress || 35;
  const learningProgress = analytics?.learningProgress || 20;
  const roadmapProgress = analytics?.roadmapCompletion || 15;
  const resumeScore = analytics?.resumeScore || 10;
  const skillGapScore = analytics?.skillGapScore || 30;

  // 1. Skill Growth Chart Data
  const skillGrowthData = [
    { name: "Languages", current: profile.languages?.length ? Math.min(profile.languages.length * 20, 100) : 10, target: 100 },
    { name: "Frameworks", current: profile.frameworks?.length ? Math.min(profile.frameworks.length * 15, 100) : 15, target: 100 },
    { name: "Technical Skills", current: profile.skills?.length ? Math.min(profile.skills.length * 12, 100) : 20, target: 100 },
    { name: "Interests Match", current: profile.interests?.length ? Math.min(profile.interests.length * 25, 100) : 25, target: 100 },
  ];

  // 2. Placement Readiness Trend Data (Diagnostic progression simulate)
  const trendData = [
    { label: "Wk 1", readiness: Math.max(readiness - 15, 10), resume: Math.max(resumeScore - 10, 5), skills: Math.max(skillsProgress - 15, 10) },
    { label: "Wk 2", readiness: Math.max(readiness - 10, 15), resume: Math.max(resumeScore - 5, 5), skills: Math.max(skillsProgress - 10, 15) },
    { label: "Wk 3", readiness: Math.max(readiness - 5, 25), resume: Math.max(resumeScore - 2, 8), skills: Math.max(skillsProgress - 5, 20) },
    { label: "Current", readiness: readiness, resume: resumeScore, skills: skillsProgress },
  ];

  // 3. Daily Learning Study Consistency
  const studyHoursData = [
    { day: "Mon", target: profile.dailyStudyHours, current: Math.max(profile.dailyStudyHours - 1, 1) },
    { day: "Tue", target: profile.dailyStudyHours, current: profile.dailyStudyHours },
    { day: "Wed", target: profile.dailyStudyHours, current: profile.dailyStudyHours + 1 },
    { day: "Thu", target: profile.dailyStudyHours, current: Math.max(profile.dailyStudyHours - 2, 1) },
    { day: "Fri", target: profile.dailyStudyHours, current: profile.dailyStudyHours },
    { day: "Sat", target: profile.dailyStudyHours, current: Math.min(profile.dailyStudyHours + 2, 12) },
    { day: "Sun", target: profile.dailyStudyHours, current: Math.min(profile.dailyStudyHours + 1, 12) },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Analytics Dashboard</h1>
            <p className="text-xs text-slate-400">
              Interactive analytics tracks growth, curriculum milestones, and placement coefficients.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Placement Readiness & Resume Growth trend */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-400" />
            Readiness & Skills Diagnostic Progression
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: "10px" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="readiness" name="Placement Readiness Index" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={2} />
                <Area type="monotone" dataKey="skills" name="Skills Progress" stroke="#6366f1" fillOpacity={1} fill="url(#colorSkills)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Category Profile Growth */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-indigo-400" />
            Skills Registry Index Balance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "10px" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="current" name="Your Profile Score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="target" name="Industry Standard" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study target Hours vs Actual Study target Hours */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            Weekly Learning Coach Target Consistency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: "10px" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Line type="monotone" dataKey="current" name="Hours Studied" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" name="Target hours" stroke="#64748b" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resume improvement and ATS progress bar representation */}
        <div className="glass-panel rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-blue-400" />
              Diagnostic Index Metrics
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>ATS Resume Score</span>
                  <span className="font-mono font-bold text-blue-400">{resumeScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${resumeScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Academic Roadmap Completion</span>
                  <span className="font-mono font-bold text-purple-400">{roadmapProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${roadmapProgress}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Skill Competency Match</span>
                  <span className="font-mono font-bold text-indigo-400">{skillGapScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${skillGapScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 italic">
            "Your placement metrics recalculate automatically when you update your skills profile registry, upload high-quality portfolio resumes, or check off topics."
          </div>
        </div>
      </div>
    </div>
  );
}
