/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  StudentProfile,
  MentorMessage
} from "../types";
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Compass,
  ArrowRight,
  BrainCircuit,
  Loader2
} from "lucide-react";

interface MentorHubViewProps {
  profile: StudentProfile;
  messages: MentorMessage[];
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
}

export default function MentorHubView({
  profile,
  messages,
  onSendMessage,
  loading,
}: MentorHubViewProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    `How can I improve my skills to match my career goal?`,
    `What specific project fits my current skillset registry?`,
    `What certificates are best for a ${profile.careerGoal} role?`,
    `Review my daily hours commitment - is it enough?`,
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const msg = inputText.trim();
    setInputText("");
    onSendMessage(msg);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-2 text-slate-200 flex flex-col h-[calc(100vh-10rem)] font-sans">
      {/* Banner */}
      <div className="flex-shrink-0 flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <MessageSquare className="w-5.5 h-5.5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white">AI Career Mentor Hub</h1>
          <p className="text-xs text-slate-400">
            Fully cognitive agent with access to your entire Student Digital Twin. No generic advice.
          </p>
        </div>
      </div>

      {/* Main chat messages list */}
      <div className="flex-grow glass-panel rounded-2xl p-6 flex flex-col justify-between overflow-hidden border-slate-800 relative">
        <div className="absolute inset-0 bg-radial-at-b from-blue-500/3 to-transparent pointer-events-none" />

        <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 scrollbar">
          {messages.length === 0 ? (
            /* Starter Prompts Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 py-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white">Consult your Career Mentor Agent</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ask targeted questions regarding your roadmap, technical skill alignment, CGPA, resume formatting, or study target improvements.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 w-full">
                {starterPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(prompt)}
                    className="p-3 text-left rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/30 text-xs text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Actual Chat Bubbles */
            <div className="space-y-4 pt-1">
              {messages.map((msg) => {
                const isAI = msg.sender === "ai";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${isAI ? "" : "flex-row-reverse"}`}
                  >
                    {/* Icon / Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      isAI
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}>
                      {isAI ? <Compass className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                    </div>

                    {/* Speech bubble */}
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isAI
                        ? "bg-[#111a30]/50 border border-blue-500/10 text-slate-200"
                        : "bg-blue-600/15 border border-blue-500/20 text-slate-100"
                    }`}>
                      <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap">
                        {msg.text}
                      </div>
                      <div className={`text-[9px] font-mono mt-2 text-right ${isAI ? "text-slate-500" : "text-blue-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  </div>
                  <div className="bg-[#111a30]/50 border border-blue-500/10 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span>AI Mentor is conceptualizing your profile...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Text Input area */}
        <form onSubmit={handleSubmit} className="flex-shrink-0 flex items-center gap-3 pt-3 border-t border-slate-800/60">
          <input
            type="text"
            placeholder={loading ? "Synthesizing response..." : `Message your Mentor Agent regarding ${profile.careerGoal} placement...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-grow px-4 py-3 rounded-xl text-xs text-slate-100 placeholder-slate-500 glass-input transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
