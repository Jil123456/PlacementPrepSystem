const pdfParse = require('pdf-parse');
const { GoogleGenAI, Type } = require('@google/genai');
const { successResponse, errorResponse } = require('../utils/helpers');

let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const SYSTEM_INSTRUCTION = `
You are an expert ATS (Applicant Tracking System) and Technical Recruiter.
Your job is to analyze resumes for a software engineering or tech role.
Given the text of a resume, evaluate its ATS compatibility, missing keywords, strong points, and actionable improvement tips.
You must return your analysis as a JSON object that perfectly matches the required schema.
Do NOT use markdown code blocks (like \`\`\`json) in your response, just return the raw JSON object.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ats_score: {
      type: Type.INTEGER,
      description: "Overall ATS compatibility score from 0 to 100",
    },
    missing_keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Important tech keywords missing from the resume",
    },
    strong_points: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "What the resume does well",
    },
    improvement_tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable tips to improve the resume",
    },
  },
  required: ["ats_score", "missing_keywords", "strong_points", "improvement_tips"],
};

exports.analyzeResume = async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json(errorResponse('AI service is not configured.'));
    }

    if (!req.file) {
      return res.status(400).json(errorResponse('No PDF file uploaded.'));
    }

    // Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json(errorResponse('Could not extract text from the PDF. It might be an image-based PDF.'));
    }

    // Call Gemini to analyze the resume
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Analyze the following resume:\n\n${resumeText}` }],
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    const resultText = response.text;
    let analysis;
    try {
      analysis = JSON.parse(resultText);
    } catch (e) {
      return res.status(500).json(errorResponse('AI returned invalid JSON format.'));
    }

    return res.status(200).json(successResponse(analysis));
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    return res.status(500).json(errorResponse('Failed to analyze resume.'));
  }
};
