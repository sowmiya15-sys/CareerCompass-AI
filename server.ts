/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with higher limit for resume base64 uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please set it in the Secrets/Settings panel.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// API Routes

// 1. Analyze and extract resume details using OCR/AI
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName, resumeText } = req.body;
    let textToAnalyze = resumeText || "";

    // If a DOCX file is provided via base64, parse it to text using mammoth
    if (fileBase64 && mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const buffer = Buffer.from(fileBase64, "base64");
      const result = await mammoth.extractRawText({ buffer });
      textToAnalyze = result.value;
    }

    const ai = getGeminiClient();

    let geminiResponse;
    const prompt = `Analyze this student's resume or text. Extract key details and return a strictly structured JSON response.
Do NOT include any markdown wrapping or explanation outside of the JSON.

Expected JSON format:
{
  "cgpa": number (between 0.0 and 10.0, default to 0.0 if not found),
  "skills": Array of strings (technical skills, e.g. ["React", "Python", "Data Structures"]),
  "languages": Array of strings (programming languages, e.g. ["JavaScript", "Python", "C++"]),
  "frameworks": Array of strings (frameworks/libraries, e.g. ["Express", "React", "Django"]),
  "interests": Array of strings (domains/areas of interest, e.g. ["Web Development", "Artificial Intelligence", "DevOps"]),
  "dailyStudyHours": number (default to 2),
  "preferredLearningStyle": string (MUST be one of: "Visual", "Practical", "Theoretical" - default to "Practical"),
  "githubProfile": string (extracted GitHub URL, or empty string if not found),
  "linkedinProfile": string (extracted LinkedIn URL, or empty string if not found),
  "resumeText": string (a comprehensive summary of their experience, projects, and education text extracted from the resume)
}

If certain information is missing, leave the arrays empty or use the specified default values. Do not make up profiles.`;

    if (fileBase64 && mimeType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // PDF or Images (PNG, JPG, JPEG)
      // Send the file as inline data directly to Gemini
      geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
    } else {
      // Use the text (either pasted or extracted from DOCX)
      geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${prompt}\n\nRESUME CONTENT:\n${textToAnalyze}`,
        config: {
          responseMimeType: "application/json",
        },
      });
    }

    const jsonText = geminiResponse.text?.trim() || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

// 2. Roadmap Agent
app.post("/api/agent/roadmap", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: "Student profile is required" });

    const ai = getGeminiClient();
    const prompt = `You are the Roadmap Agent in the CareerCompass AI Agentic OS.
Your objective is to generate a custom, highly structured semester-wise learning roadmap based on the student's profile:
- Name: ${profile.fullName}
- Branch: ${profile.branch}
- Year/Semester: ${profile.academicYear} - ${profile.semester}
- Career Goal (Dream Role): ${profile.careerGoal}
- CGPA: ${profile.cgpa}
- Skills: ${profile.skills?.join(", ")}
- Languages: ${profile.languages?.join(", ")}
- Frameworks: ${profile.frameworks?.join(", ")}
- Interests: ${profile.interests?.join(", ")}
- Preferred Learning Style: ${profile.preferredLearningStyle}

Generate a semester-by-semester learning plan for their remaining semesters (e.g. if they are in Year 2 Semester 1, generate plans for subsequent semesters up to Semester 8).
Your output MUST be a strict JSON matching this structure (no markdown wrapper, just raw JSON):
{
  "semesters": [
    {
      "semester": "Semester 3 (Example)",
      "programmingLanguages": ["Language name"],
      "dsa": ["Data structures topics to cover"],
      "development": ["Development concepts/stacks to learn"],
      "aiAndCloud": ["AI or Cloud tools and platforms"],
      "projects": ["Specific project ideas they should build this semester"],
      "certifications": ["Recommended certificates or courses"],
      "interviewPrep": ["Interview preparation focus areas"]
    }
  ]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = geminiResponse.text?.trim() || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error in Roadmap Agent:", error);
    res.status(500).json({ error: error.message || "Failed to generate roadmap" });
  }
});

// 3. Learning Coach Agent
app.post("/api/agent/learning-coach", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: "Student profile is required" });

    const ai = getGeminiClient();
    const prompt = `You are the Learning Coach Agent in the CareerCompass AI Agentic OS.
Your task is to generate a daily (Monday to Sunday) and weekly study schedule to help this student stay on track for their career goal.
Student Profile:
- Career Goal: ${profile.careerGoal}
- Current Skills: ${profile.skills?.join(", ")}
- Daily Study Commitment: ${profile.dailyStudyHours} hours
- Learning Style: ${profile.preferredLearningStyle}

Output a strictly compliant JSON with daily plans and tips.
JSON format:
{
  "dailyPlan": [
    {
      "day": "Monday",
      "topics": [
        { "id": "m1", "title": "Topic Title", "duration": "e.g. 1.5 hours", "completed": false, "day": "Monday" }
      ],
      "revisionSchedule": "e.g. 30 mins active recall of Monday's topics"
    },
    ... (continue for Tuesday to Sunday)
  ],
  "weeklyGoal": "Overall high level goal for this week",
  "tips": ["Tips for staying consistent", "Tips customized for preferred learning style"]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = geminiResponse.text?.trim() || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error in Learning Coach Agent:", error);
    res.status(500).json({ error: error.message || "Failed to generate study plan" });
  }
});

// 4. Project Mentor Agent
app.post("/api/agent/project-mentor", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: "Student profile is required" });

    const ai = getGeminiClient();
    const prompt = `You are the Project Mentor Agent in the CareerCompass AI Agentic OS.
Suggest exactly 3 personalized project ideas at different difficulty levels (Beginner, Intermediate, Advanced) matching the student:
- Branch: ${profile.branch}
- Goal: ${profile.careerGoal}
- Skills: ${profile.skills?.join(", ")}
- Frameworks/Languages: ${profile.languages?.join(", ")} & ${profile.frameworks?.join(", ")}
- Interests: ${profile.interests?.join(", ")}

For each project, detail the tech stack, folders/architecture, third-party APIs to incorporate, specific implementation steps, and concrete learning outcomes.
Output a strictly structured JSON response.
JSON format:
{
  "projects": [
    {
      "title": "Project Title",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "techStack": ["React", "Express", "MongoDB", "Tailwind CSS"],
      "architecture": "Describe folder structure or architectural pattern",
      "apis": ["API name/usage (e.g. GitHub API, OpenWeather API)"],
      "implementationSteps": ["Step 1...", "Step 2...", "Step 3..."],
      "learningOutcomes": ["Outcome 1...", "Outcome 2..."]
    }
  ]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = geminiResponse.text?.trim() || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error in Project Mentor Agent:", error);
    res.status(500).json({ error: error.message || "Failed to suggest projects" });
  }
});

// 5. Resume Analyzer Agent
app.post("/api/agent/resume-analyzer", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: "Student profile is required" });

    const resumeContent = profile.resumeText || "";
    const ai = getGeminiClient();

    const prompt = `You are the Resume Analyzer Agent in the CareerCompass AI Agentic OS.
Analyze the student's resume text.
If the student hasn't uploaded a resume (resumeText is empty), AUTOMATICALLY generate a professionally formatted resume in clean markdown format based on their Student Digital Twin (profile info below) and analyze that instead! Let them know in the feedback that this resume was generated from their digital twin memory.

Student Profile Details:
- Name: ${profile.fullName}
- Branch: ${profile.branch}
- Year/Semester: ${profile.academicYear} - ${profile.semester}
- Goal: ${profile.careerGoal}
- CGPA: ${profile.cgpa}
- Skills: ${profile.skills?.join(", ")}
- Languages: ${profile.languages?.join(", ")}
- Frameworks: ${profile.frameworks?.join(", ")}
- Interests: ${profile.interests?.join(", ")}
- GitHub: ${profile.githubProfile}
- LinkedIn: ${profile.linkedinProfile}

Evaluate formatting, keywords, projects, skills, and achievements. Calculate an ATS score (0 to 100).
Output a strictly structured JSON response.
JSON format:
{
  "atsScore": number (0-100),
  "skillsFeedback": [
    { "status": "good" | "needs_improvement" | "missing", "detail": "Feedback detail" }
  ],
  "projectsFeedback": ["Bullet point feedback on projects"],
  "formattingFeedback": ["Bullet point feedback on format/layout"],
  "keywordSuggestions": ["Keywords to add for ATS optimization"],
  "achievementsFeedback": ["Feedback on listing quantifiable achievements"],
  "improvements": ["Step-by-step clear list of improvements"],
  "generatedRawResume": "The Markdown string of the generated resume (only if they had no uploaded resume, otherwise null or empty string)"
}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}\n\nUPLOADED RESUME TEXT (IF ANY):\n${resumeContent}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = geminiResponse.text?.trim() || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error in Resume Analyzer Agent:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

// 6. Skill Gap Analyzer Agent
app.post("/api/agent/skill-gap", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: "Student profile is required" });

    const ai = getGeminiClient();
    const prompt = `You are the Skill Gap Analyzer Agent in the CareerCompass AI Agentic OS.
Compare the student's skills with industry requirements for their target careerGoal: "${profile.careerGoal}".
Student Profile Details:
- Skills: ${profile.skills?.join(", ")}
- Languages: ${profile.languages?.join(", ")}
- Frameworks: ${profile.frameworks?.join(", ")}

Output a strictly structured JSON.
JSON format:
{
  "dreamRole": "${profile.careerGoal}",
  "currentSkills": ["Current skills matching or relevant"],
  "missingSkills": ["Critical skills they need to acquire"],
  "skillMatchPercentage": number (0-100),
  "priorityLearningOrder": [
    { "skill": "Skill name", "priority": "High" | "Medium" | "Low", "reason": "Reason why" }
  ],
  "estimatedWeeksToReady": number (weeks needed to become placement-ready),
  "improvementPlan": ["Step 1...", "Step 2..."]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = geminiResponse.text?.trim() || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error in Skill Gap Analyzer Agent:", error);
    res.status(500).json({ error: error.message || "Failed to analyze skill gaps" });
  }
});

// 7. Analytics Agent
app.post("/api/agent/analytics", async (req, res) => {
  try {
    const { profile, roadmap, studyPlan, projectMentor, resumeAnalysis, skillGap } = req.body;
    if (!profile) return res.status(400).json({ error: "Student profile is required" });

    const ai = getGeminiClient();
    const prompt = `You are the Analytics Agent in the CareerCompass AI Agentic OS.
Synthesize all the currently generated data to compute accurate overall progress scores (0-100) and generate strategic, personalized AI Insights and Recent Recommendations.

Current Workspace State:
- Profile: Name=${profile.fullName}, CareerGoal=${profile.careerGoal}, CGPA=${profile.cgpa}, SkillsCount=${profile.skills?.length || 0}
- Roadmap: ${roadmap ? "Generated" : "Not yet generated"}
- Study Plan: ${studyPlan ? "Generated" : "Not yet generated"}
- Projects: ${projectMentor ? "Generated" : "Not yet generated"}
- Resume Analysis: ${resumeAnalysis ? `ATS Score = ${resumeAnalysis.atsScore}` : "Not yet analyzed"}
- Skill Gap: ${skillGap ? `Match = ${skillGap.skillMatchPercentage}%` : "Not yet analyzed"}

Based on this, output a strictly formatted JSON with key metrics (placementReadinessScore, skillsProgress, learningProgress, roadmapCompletion, resumeScore, and skillGapScore) plus AI insights (at least 3) and action-oriented recent recommendations (at least 3).

JSON format:
{
  "placementReadinessScore": number (overall score 0-100),
  "skillsProgress": number (0-100),
  "learningProgress": number (0-100),
  "roadmapCompletion": number (0-100),
  "resumeScore": number (0-100),
  "skillGapScore": number (0-100),
  "aiInsights": ["Detailed insight 1", "Detailed insight 2", "Detailed insight 3"],
  "recentRecommendations": ["Action 1", "Action 2", "Action 3"]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = geminiResponse.text?.trim() || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("Error in Analytics Agent:", error);
    res.status(500).json({ error: error.message || "Failed to generate analytics" });
  }
});

// 8. Career Mentor Hub
app.post("/api/agent/mentor-hub", async (req, res) => {
  try {
    const { profile, messages, userMessage } = req.body;
    if (!profile) return res.status(400).json({ error: "Student profile is required" });

    const ai = getGeminiClient();

    // Prepare message history
    const contents: any[] = [
      {
        role: "user",
        parts: [
          {
            text: `You are the Career Mentor Agent in the CareerCompass AI Agentic OS.
You have access to the student's Digital Twin memory:
- Name: ${profile.fullName}
- Branch: ${profile.branch}
- Year/Semester: ${profile.academicYear} - ${profile.semester}
- Goal: ${profile.careerGoal}
- CGPA: ${profile.cgpa}
- Skills: ${profile.skills?.join(", ")}
- Languages: ${profile.languages?.join(", ")}
- Frameworks: ${profile.frameworks?.join(", ")}
- Interests: ${profile.interests?.join(", ")}
- Learning Style: ${profile.preferredLearningStyle}

Your task is to provide hyper-personalized, constructive, and empowering career mentorship. Respond to their questions keeping their profile in mind. Always be highly specific rather than generic. Provide clean markdown.`
          }
        ]
      }
    ];

    // Add previous message history
    if (messages && messages.length > 0) {
      messages.forEach((msg: any) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add final message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    res.json({ text: geminiResponse.text });
  } catch (error: any) {
    console.error("Error in Career Mentor Agent:", error);
    res.status(500).json({ error: error.message || "Failed to generate mentor response" });
  }
});


// Serve Vite or static files based on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
