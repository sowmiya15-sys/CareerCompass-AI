/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { StudentProfile } from "../types";
import {
  Settings,
  Database,
  Trash2,
  FileDown,
  RefreshCw,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface SettingsViewProps {
  profile: StudentProfile;
  onClearSession: () => void;
  onReinitializeAllMemory: () => Promise<void>;
  loading: boolean;
}

export default function SettingsView({
  profile,
  onClearSession,
  onReinitializeAllMemory,
  loading,
}: SettingsViewProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const handleDownloadMemoryDump = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `careercompass_digital_twin_memory_${profile.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearMemory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearSession();
  };

  const handleSyncDiagnostics = async () => {
    setSuccessMsg("");
    try {
      await onReinitializeAllMemory();
      setSuccessMsg("Diagnostics sync run successfully! All Agent minds aligned.");
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-2 text-slate-200 font-sans">
      {/* Banner */}
      <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Settings className="w-5.5 h-5.5" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-white">System Settings</h1>
          <p className="text-xs text-slate-400">
            Audit backend cognitive states, download memory buffers, or hard reset the CareerCompass Agentic OS.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core memory buffers */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-400" />
            Digital Twin Memory Inspector
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your Digital Twin stores your entire career preferences as an active JSON state shared across Roadmaps, Mentors, and Analyzers.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadMemoryDump}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
              <span>Download Memory Buffer (.json)</span>
            </button>

            <button
              onClick={handleSyncDiagnostics}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/20 text-xs text-indigo-400 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-indigo-400" />}
              <span>Diagnose & Re-align Agents</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border-red-500/10">
          <h3 className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider pb-2 border-b border-red-950/40 flex items-center gap-1.5">
            <AlertOctagon className="w-4.5 h-4.5 text-red-400" />
            Danger Zone
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deleting your session will clear all persistent state keys from this device and return you to the onboarding landing page. All saved Firestore files will remain safe in the cloud.
          </p>

          <div className="pt-2">
            <button
              onClick={handleClearMemory}
              className={`w-full py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border ${
                confirmClear
                  ? "bg-red-600 hover:bg-red-500 text-white border-red-500"
                  : "bg-red-500/5 hover:bg-red-500/15 border-red-500/20 text-red-400"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{confirmClear ? "Confirm: Reset CareerCompass" : "Clear Local Session"}</span>
            </button>
            {confirmClear && (
              <button
                onClick={() => setConfirmClear(false)}
                className="w-full mt-2 text-center text-[10px] text-slate-500 hover:text-slate-300 font-mono"
              >
                Cancel reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Details footer */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/60 flex items-center gap-1.5">
          <Info className="w-4.5 h-4.5 text-blue-400" />
          Technical Blueprint & Agentic Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Cognitive Agents
            </h4>
            <p className="leading-relaxed text-[11px]">
              7 collaborating agents (Roadmap, Coach, Project Mentor, Skill Gap, Resume, Career Mentor, and Analytics) share the digital twin memory to prevent duplicate requests.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Cloud Database
            </h4>
            <p className="leading-relaxed text-[11px]">
              Active cloud synchronization backed by Firebase Firestore. Real-time updates occur instantly whenever checkmarks are clicked.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Vision & OCR SDK
            </h4>
            <p className="leading-relaxed text-[11px]">
              PDF/Image file deconstruction uses Gemini multimodal base64 streams directly over secure API connections, bypass local binary processors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
