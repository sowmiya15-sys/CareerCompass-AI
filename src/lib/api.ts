/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentProfile } from "../types";

export async function analyzeResume(payload: {
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
  resumeText?: string;
}) {
  const res = await fetch("/api/analyze-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to analyze resume");
  }
  return res.json();
}

export async function generateRoadmap(profile: StudentProfile) {
  const res = await fetch("/api/agent/roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate roadmap");
  }
  return res.json();
}

export async function generateLearningPlan(profile: StudentProfile) {
  const res = await fetch("/api/agent/learning-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate study plan");
  }
  return res.json();
}

export async function generateProjects(profile: StudentProfile) {
  const res = await fetch("/api/agent/project-mentor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate project suggestions");
  }
  return res.json();
}

export async function analyzeProfileResume(profile: StudentProfile) {
  const res = await fetch("/api/agent/resume-analyzer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to analyze resume");
  }
  return res.json();
}

export async function analyzeSkillGap(profile: StudentProfile) {
  const res = await fetch("/api/agent/skill-gap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to analyze skill gaps");
  }
  return res.json();
}

export async function generateAnalytics(
  profile: StudentProfile,
  extra: {
    roadmap?: any;
    studyPlan?: any;
    projectMentor?: any;
    resumeAnalysis?: any;
    skillGap?: any;
  }
) {
  const res = await fetch("/api/agent/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, ...extra }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate dashboard analytics");
  }
  return res.json();
}

export async function sendMentorMessage(
  profile: StudentProfile,
  messages: any[],
  userMessage: string
) {
  const res = await fetch("/api/agent/mentor-hub", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, messages, userMessage }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to get response from AI Mentor");
  }
  return res.json();
}
