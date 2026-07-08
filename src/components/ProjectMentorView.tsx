/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  StudentProfile,
  ProjectMentorData,
  ProjectSuggestion
} from "../types";
import {
  FolderKanban,
  Sparkles,
  Loader2,
  Cpu,
  Layers,
  Code,
  CheckCircle2,
  Network,
  Hammer
} from "lucide-react";

interface ProjectMentorViewProps {
  profile: StudentProfile;
  projectsData: ProjectMentorData | null;
  onGenerateProjects: () => Promise<void>;
  loading: boolean;
}

export default function ProjectMentorView({
  profile,
  projectsData,
  onGenerateProjects,
  loading,
}: ProjectMentorViewProps) {
  const [activeProject, setActiveProject] = useState<number>(0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FolderKanban className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">AI Project Mentor</h1>
            <p className="text-xs text-slate-400">
              Personalized capstone and sandbox project designs configured around your skills and tailored for <span className="text-blue-400 font-semibold">{profile.careerGoal}</span> placements.
            </p>
          </div>
        </div>

        {projectsData && (
          <button
            onClick={onGenerateProjects}
            disabled={loading}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 text-xs font-semibold rounded-xl text-slate-200 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-400" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
            <span>Regenerate Projects</span>
          </button>
        )}
      </div>

      {!projectsData ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 mx-auto">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-display font-bold text-white">Unlock Tailored Projects</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Project Mentor Agent will model 3 highly specific projects (Beginner, Intermediate, and Advanced) with production-ready folder architecture, tech stacks, and step-by-step guides.
            </p>
          </div>
          <button
            onClick={onGenerateProjects}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl transition-all hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Designing project blueprints...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Blueprint Portfolio Projects</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Content layout */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Difficulty Tabs Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <label className="text-[10px] uppercase font-mono text-slate-500 px-1">Project Portfolio</label>
            <div className="space-y-2">
              {projectsData.projects?.map((proj, idx) => {
                const colors = {
                  Beginner: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30",
                  Intermediate: "text-blue-400 bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30",
                  Advanced: "text-purple-400 bg-purple-500/5 border-purple-500/10 hover:border-purple-500/30",
                };

                const activeColors = {
                  Beginner: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
                  Intermediate: "bg-blue-500/15 border-blue-500/40 text-blue-300",
                  Advanced: "bg-purple-500/15 border-purple-500/40 text-purple-300",
                };

                const isActive = activeProject === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveProject(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                      isActive ? activeColors[proj.difficulty] : colors[proj.difficulty]
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold opacity-80">
                      {proj.difficulty} Level
                    </span>
                    <span className="text-xs font-semibold leading-relaxed truncate text-white">
                      {proj.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Details Panel */}
          <div className="md:col-span-3 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              {/* Project Header */}
              <div className="pb-4 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-display font-bold text-white">
                      {projectsData.projects?.[activeProject]?.title}
                    </h2>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    AI Curated Sandbox • Configured for student twin skillset memory
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border ${
                    projectsData.projects?.[activeProject]?.difficulty === "Beginner"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : projectsData.projects?.[activeProject]?.difficulty === "Intermediate"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  }`}>
                    {projectsData.projects?.[activeProject]?.difficulty}
                  </span>
                </div>
              </div>

              {/* Technologies Stack & Integration APIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Tech Stack */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    Target Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {projectsData.projects?.[activeProject]?.techStack?.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Third Party APIs */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Network className="w-4 h-4 text-indigo-400" />
                    Integration Core & APIs
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {projectsData.projects?.[activeProject]?.apis?.map((api, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-400">
                        {api}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Folder Architecture / Design */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Recommended Folder Architecture & Directory Outline
                </h3>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 overflow-x-auto leading-relaxed whitespace-pre">
                  {projectsData.projects?.[activeProject]?.architecture}
                </pre>
              </div>

              {/* Step-by-Step implementation */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-emerald-400" />
                  Step-by-Step Implementation Roadmap
                </h3>
                <div className="space-y-2.5">
                  {projectsData.projects?.[activeProject]?.implementationSteps?.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="mt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Learning Outcomes */}
              <div className="space-y-3 pt-4 border-t border-slate-800/60">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Knowledge & Learning Outcomes
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {projectsData.projects?.[activeProject]?.learningOutcomes?.map((outcome, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
