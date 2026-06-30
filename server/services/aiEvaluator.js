const { GoogleGenAI } = require('@google/genai');

let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not set. AI evaluation will fallback to basic exact-match logic or pass through.");
}

/**
 * Evaluates an open-ended interview answer using Gemini.
 * @param {string} question The original interview question
 * @param {string} userAnswer The user's typed answer
 * @param {string} category The category ('hr' or 'aptitude')
 * @param {string} idealAnswer (Optional) the provided correct answer from DB
 * @returns {Promise<{isCorrect: boolean, feedback: string, idealAnswer: string}>}
 */
async function evaluateAnswer(question, userAnswer, category, idealAnswer = '') {
  if (!ai) {
    // Fallback if no API key
    if (category === 'hr') {
        return {
            isCorrect: true, // Auto-pass HR if no AI
            feedback: "No AI configured. Answer marked complete. Please configure GEMINI_API_KEY.",
            idealAnswer: idealAnswer || "An honest, structured response using the STAR method."
        };
    } else {
        // For aptitude, do a basic string compare if no AI
        const isCorrect = userAnswer.toLowerCase().trim() === (idealAnswer || '').toLowerCase().trim();
        return {
            isCorrect,
            feedback: isCorrect ? "Correct!" : "Incorrect.",
            idealAnswer: idealAnswer
        };
    }
  }

  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer to an interview question.

Category: ${category}
Question: "${question}"
${idealAnswer ? `Ideal Baseline Answer/Concept: "${idealAnswer}"` : ''}

Candidate's Answer:
"""
${userAnswer}
"""

Evaluate the candidate's answer.
- If it's an HR question, it should be logical, honest, structured (STAR method if applicable), and professional. Be lenient but constructive.
- If it's an Aptitude/Logic question, verify if their thought process or final answer is mathematically/logically sound.

Respond ONLY with a valid JSON object in the following format:
{
  "score": 0-10 (number representing the quality of the answer),
  "feedback": "A concise paragraph (2-3 sentences) explaining what they did well and what they missed.",
  "explanation": "A detailed explanation of WHY their answer was wrong or what they should focus on to improve. If the answer is complete gibberish, explain the core concept they should have addressed.",
  "passed": true/false (true if the answer is acceptable/passing, false if it fundamentally fails the interview or is logically wrong)
}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const jsonStr = response.text;
    const result = JSON.parse(jsonStr);
    
    return {
      isCorrect: Boolean(result.passed),
      score: result.score || 0,
      feedback: result.feedback || "Evaluated.",
      explanation: result.explanation || result.feedback || "",
      idealAnswer: idealAnswer
    };

  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return {
      isCorrect: false,
      score: 0,
      feedback: "Failed to evaluate answer using AI. " + error.message,
      idealAnswer: idealAnswer
    };
  }
}

module.exports = {
  evaluateAnswer
};
