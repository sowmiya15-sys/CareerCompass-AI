/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  StudentProfile,
  StudyPlan,
  StudyTopic
} from "../types";
import {
  BookOpen,
  Sparkles,
  Loader2,
  CheckSquare,
  Square,
  TrendingUp,
  Clock,
  Compass,
  Lightbulb,
  CalendarCheck
} from "lucide-react";

interface LearningCoachViewProps {
  profile: StudentProfile;
  studyPlan: StudyPlan | null;
  onGeneratePlan: () => Promise<void>;
  onToggleTopic: (dayIndex: number, topicId: string, completed: boolean) => Promise<void>;
  loading: boolean;
}

export default function LearningCoachView({
  profile,
  studyPlan,
  onGeneratePlan,
  onToggleTopic,
  loading,
}: LearningCoachViewProps) {
  const [activeDay, setActiveDay] = useState<string>("Monday");

  const handleCheckboxClick = async (dayIndex: number, topicId: string, currentCompleted: boolean) => {
    try {
      await onToggleTopic(dayIndex, topicId, !currentCompleted);
    } catch (err) {
      console.error("Failed to toggle topic completion:", err);
    }
  };

  const getDayIndex = (dayName: string) => {
    if (!studyPlan) return 0;
    return studyPlan.dailyPlan?.findIndex((d) => d.day === dayName) ?? 0;
  };

  const activeDayIndex = getDayIndex(activeDay);
  const activeDayData = studyPlan?.dailyPlan?.[activeDayIndex];

  // Calculate statistics
  const totalTopics = studyPlan?.dailyPlan?.reduce((acc, curr) => acc + (curr.topics?.length || 0), 0) || 0;
  const completedTopics = studyPlan?.dailyPlan?.reduce((acc, curr) => acc + (curr.topics?.filter((t) => t.completed).length || 0), 0) || 0;
  const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">AI Learning Coach</h1>
            <p className="text-xs text-slate-400">
              Personalized micro-study schedules aligned to your target goal, designed specifically for <span className="text-blue-400 font-semibold">{profile.preferredLearningStyle}</span> learners.
            </p>
          </div>
        </div>

        {studyPlan && (
          <button
            onClick={onGeneratePlan}
            disabled={loading}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 text-xs font-semibold rounded-xl text-slate-200 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-400" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
            <span>Regenerate Study Plan</span>
          </button>
        )}
      </div>

      {!studyPlan ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 mx-auto">
            <CalendarCheck className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-display font-bold text-white">Generate Your Daily Study Plan</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate your Learning Coach Agent to create a highly structured Monday-to-Sunday routine. Specify daily goals, revision timers, and visual, theoretical, or practical tips.
            </p>
          </div>
          <button
            onClick={onGeneratePlan}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl transition-all hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Generating custom routine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Daily Routine</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Content Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Daily Selection Panel & Progress */}
          <div className="md:col-span-1 space-y-6">
            {/* Weekly Completion Progress */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60">
                Weekly Routine Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Weekly Goal Completion</span>
                  <span className="font-mono font-bold text-blue-400">{completionPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 text-center font-mono pt-1">
                  {completedTopics} of {totalTopics} study milestones cleared
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/40">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Weekly Focus Goal</div>
                <p className="text-xs text-slate-300 italic">"{studyPlan.weeklyGoal}"</p>
              </div>
            </div>

            {/* Day selector list */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-slate-500 px-1">Study Schedule Days</label>
              <div className="space-y-1">
                {studyPlan.dailyPlan?.map((dayPlan) => {
                  const dayIndex = getDayIndex(dayPlan.day);
                  const isCompleted = dayPlan.topics?.every((t) => t.completed) && dayPlan.topics?.length > 0;
                  const dayCompletedCount = dayPlan.topics?.filter((t) => t.completed).length || 0;
                  const isDayActive = activeDay === dayPlan.day;

                  return (
                    <button
                      key={dayPlan.day}
                      onClick={() => setActiveDay(dayPlan.day)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                        isDayActive
                          ? "bg-blue-600/15 border-blue-500/30 text-blue-400 font-semibold"
                          : "bg-transparent border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDayActive ? "text-blue-400 animate-pulse" : "text-slate-500"}`} />
                        <span>{dayPlan.day}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500">
                          {dayCompletedCount}/{dayPlan.topics?.length || 0}
                        </span>
                        {isCompleted && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Day Milestones List & Coach Notes */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              {/* Day Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                <h2 className="text-base font-display font-bold text-white flex items-center gap-2.5">
                  <CalendarCheck className="w-5 h-5 text-blue-400" />
                  {activeDay} Focus Milestones
                </h2>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                  Learning Style: {profile.preferredLearningStyle}
                </span>
              </div>

              {/* Topics Checkbox List */}
              <div className="space-y-3">
                {activeDayData?.topics && activeDayData.topics.length > 0 ? (
                  activeDayData.topics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => handleCheckboxClick(activeDayIndex, topic.id, topic.completed)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group ${
                        topic.completed
                          ? "bg-emerald-500/5 border-emerald-500/15 text-slate-400"
                          : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700/80 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button className="text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0">
                          {topic.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold leading-relaxed truncate ${topic.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {topic.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{topic.duration} allocated</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                          topic.completed ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {topic.completed ? "Acquired" : "Active"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-6">No study topics set for {activeDay}.</p>
                )}
              </div>

              {/* Revision Guidelines */}
              {activeDayData?.revisionSchedule && (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1.5">
                  <h4 className="text-[10px] uppercase font-mono font-bold text-blue-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Revision Strategy & Review Loop
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {activeDayData.revisionSchedule}
                  </p>
                </div>
              )}
            </div>

            {/* Coach Insights / Tips Panel */}
            {studyPlan.tips && studyPlan.tips.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/60 flex items-center gap-1.5">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-400" />
                  Coach Guidelines for {profile.preferredLearningStyle} Learning
                </h3>
                <ul className="space-y-3">
                  {studyPlan.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="text-amber-400 font-bold">•</span>
                      <p>{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
