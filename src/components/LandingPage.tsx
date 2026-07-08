/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Compass, Sparkles, GraduationCap, Briefcase, BookOpen, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onStart: (data: {
    fullName: string;
    branch: string;
    academicYear: string;
    semester: string;
    careerGoal: string;
  }) => Promise<void>;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  idPrefix: string;
}

function CustomDropdown({ value, onChange, options, idPrefix }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id={`${idPrefix}-button`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 rounded-xl text-slate-100 bg-slate-900 border border-slate-800 text-sm glass-input transition-all duration-200 flex items-center justify-between hover:border-slate-700 focus:outline-none focus:border-blue-500"
      >
        <span>{value}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            id={`${idPrefix}-backdrop`}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <ul
            id={`${idPrefix}-menu`}
            className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 p-1 shadow-2xl z-50 divide-y divide-slate-800/40"
          >
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <li key={opt} id={`${idPrefix}-option-${opt.replace(/\s+/g, "-").toLowerCase()}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors duration-150 ${
                      isSelected
                        ? "bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/20"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [fullName, setFullName] = useState("");
  const [branch, setBranch] = useState("");
  const [academicYear, setAcademicYear] = useState("Year 1");
  const [semester, setSemester] = useState("Semester 1");
  const [careerGoal, setCareerGoal] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your Full Name.");
      return;
    }
    if (!branch.trim()) {
      setError("Please enter your Branch/Department.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onStart({
        fullName: fullName.trim(),
        branch: branch.trim(),
        academicYear,
        semester,
        careerGoal,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initialize student twin. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="landing-screen" className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header id="landing-header" className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white bg-clip-text">
              CareerCompass <span className="text-blue-500 font-medium">AI</span>
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 glass-panel px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Active Cognitive Core</span>
        </div>
      </header>

      {/* Hero and Form Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-16 z-10 flex-grow justify-center">
        {/* Left Side: Copy */}
        <div className="flex-1 max-w-xl text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Agentic Student Workspace</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1] mb-6"
          >
            The Agentic AI <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
              Career Operating System
            </span> <br />
            for Students
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg mb-8 leading-relaxed"
          >
            Deploy a dedicated swarm of AI agents working together to design your customized path. Analyze skills, auto-generate portfolios, run diagnostic gap analysis, and receive tailored project mentoring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800/60"
          >
            <div>
              <div className="text-2xl font-bold font-display text-white">7+</div>
              <div className="text-xs text-slate-400">Collaborating AI Agents</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-white">100%</div>
              <div className="text-xs text-slate-400">Digital Twin Driven</div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Onboarding Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-slate-800 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              Initialize Your Twin
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Create your secure student memory profile to activate the agentic workspace.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kavya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 text-sm glass-input transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Branch / Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 text-sm glass-input transition-all duration-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    Academic Year
                  </label>
                  <CustomDropdown
                    value={academicYear}
                    onChange={setAcademicYear}
                    options={["Year 1", "Year 2", "Year 3", "Year 4"]}
                    idPrefix="academic-year"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    Semester
                  </label>
                  <CustomDropdown
                    value={semester}
                    onChange={setSemester}
                    options={[
                      "Semester 1",
                      "Semester 2",
                      "Semester 3",
                      "Semester 4",
                      "Semester 5",
                      "Semester 6",
                      "Semester 7",
                      "Semester 8",
                    ]}
                    idPrefix="semester"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Career Goal / Dream Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer, AI Developer"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 text-sm glass-input transition-all duration-200"
                  />
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-blue-500/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Assembling Digital Twin...</span>
                  </>
                ) : (
                  <>
                    <span>Start CareerCompass</span>
                    <Compass className="w-4 h-4 animate-pulse" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer id="landing-footer" className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 z-10 font-mono">
        <div>© 2026 CareerCompass AI. Designed for modern engineering portfolios.</div>
        <div className="flex items-center gap-4">
          <span className="hover:text-blue-400 transition-colors cursor-pointer">Security Sandbox</span>
          <span>•</span>
          <span className="hover:text-blue-400 transition-colors cursor-pointer">Cognitive Sync Active</span>
        </div>
      </footer>
    </div>
  );
}
