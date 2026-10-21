const { GoogleGenAI } = require('@google/genai');

class GeminiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

let client;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiError('AI assistant is not configured', 500);
  }
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
};

const BASE_RULES = `You are "Ask Gemini", the built-in assistant inside EduHub, a school attendance and learning management app at a technology training school (courses include front-end, back-end, cybersecurity, data science, data analysis).
You do NOT have access to any school records, attendance data, grades, or user accounts, and you must never pretend to. If asked about specific people or records, say you can't see that information.
Keep answers clear and reasonably short. Use plain text with simple lists when helpful.`;

const ROLE_PROMPTS = {
  student: `${BASE_RULES}
You are talking to a STUDENT. Act as a patient tutor: explain concepts, give examples, hints, and debugging guidance. Do NOT write complete solutions to assignments or full projects; guide them step by step instead, and ask what they've tried. Stay on educational and study-related topics, and politely redirect anything else.`,
  instructor: `${BASE_RULES}
You are talking to an INSTRUCTOR. Help with lesson planning, assignment ideas, rubrics, explaining concepts, and drafting constructive feedback or reports. Output is a draft for them to review and edit.`,
  admin: `${BASE_RULES}
You are talking to an ADMINISTRATOR. Help with writing announcements, policies, reports, and general school administration tasks. Output is a draft for them to review and edit.`,
};

// messages: [{ role: 'user' | 'model', content: string }]
const askGemini = async ({ role, messages }) => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      contents: messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: ROLE_PROMPTS[role] || ROLE_PROMPTS.student,
        maxOutputTokens: 800, // keeps replies fast and inside serverless time limits
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text || !text.trim()) {
      throw new GeminiError('The assistant could not produce a response. Try rephrasing.', 502);
    }
    return text.trim();
  } catch (err) {
    if (err instanceof GeminiError) throw err;
    if (err.status === 429) {
      throw new GeminiError('The AI service is busy right now. Please try again shortly.', 429);
    }
    console.error('Gemini error:', err.status, err.message);
    throw new GeminiError('AI request failed. Please try again.', 502);
  }
};

module.exports = { askGemini, GeminiError };