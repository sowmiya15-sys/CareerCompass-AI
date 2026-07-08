/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  User,
  MessageSquare,
  BookOpen,
  FolderKanban,
  Map,
  FileSearch,
  TrendingUp,
  Settings,
  LogOut,
  Compass,
  Menu,
  X,
  Target
} from "lucide-react";
import { StudentProfile } from "../types";

export type ViewType =
  | "dashboard"
  | "digital-twin"
  | "mentor-hub"
  | "learning-coach"
  | "project-mentor"
  | "roadmap-generator"
  | "resume-analyzer"
  | "skill-gap-analyzer"
  | "analytics"
  | "settings";

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  profile: StudentProfile;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  currentView,
  setView,
  profile,
  onLogout,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "digital-twin", label: "Student Digital Twin", icon: User },
    { id: "mentor-hub", label: "AI Mentor Hub", icon: MessageSquare },
    { id: "learning-coach", label: "Learning Coach", icon: BookOpen },
    { id: "project-mentor", label: "Project Mentor", icon: FolderKanban },
    { id: "roadmap-generator", label: "Roadmap Generator", icon: Map },
    { id: "resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
    { id: "skill-gap-analyzer", label: "AI Skill Gap Analyzer", icon: Target },
    { id: "analytics", label: "Analytics Dashboard", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const handleSelect = (viewId: ViewType) => {
    setView(viewId);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between p-4 bg-black/20 backdrop-blur-xl border-r border-white/10">
      {/* Brand & App Title */}
      <div>
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white tracking-tight">
              CareerCompass <span className="text-blue-500">AI</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Agentic OS v1.0</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/10 border-l-3 border-l-blue-500 text-white rounded-r-xl rounded-l-none"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-3 border-l-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mini Profile Card and Logout */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-white/10 flex items-center justify-center text-blue-400 text-xs font-semibold uppercase">
            {profile.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-200 truncate">{profile.fullName}</div>
            <div className="text-[10px] text-slate-500 truncate">{profile.careerGoal}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full h-16 bg-black/30 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
            <Compass className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">
            CareerCompass <span className="text-blue-500">AI</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer content */}
          <div className="relative w-64 max-w-sm h-full flex flex-col z-50 animate-slide-in">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
