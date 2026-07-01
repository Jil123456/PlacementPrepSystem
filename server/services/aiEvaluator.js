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

/**
 * Evaluates the time and space complexity of source code by combining
 * empirical execution data with AI static analysis.
 */
async function evaluateCodeComplexity(questionTitle, code, language, empiricalTime, empiricalSpace, idealTime, idealSpace) {
  if (!ai) {
    return {
      is_optimal: false,
      feedback: "AI Evaluation disabled. Configure GEMINI_API_KEY.",
      ai_explanation: "Fallback mode.",
      final_time: empiricalTime,
      final_space: empiricalSpace
    };
  }

  const prompt = `
You are an expert technical interviewer evaluating a candidate's code submission for Data Structures and Algorithms.

Question: "${questionTitle}"
Language: ${language}
Ideal Time Complexity: ${idealTime || 'O(N)'}
Ideal Space Complexity: ${idealSpace || 'O(1)'}

Candidate's Code:
"""
${code}
"""

Empirical Curve Fitting Results (Execution Sandbox):
- Measured Time Complexity: ${empiricalTime}
- Measured Space Complexity: ${empiricalSpace}

Your Task:
1. Review the candidate's code to determine the actual theoretical Time and Space complexity.
2. Cross-check your theoretical analysis with the Empirical Curve Fitting Results. If the empirical results are wild (e.g. O(1) for a clearly O(N^2) loop due to small inputs), OVERRIDE the empirical guess with the true theoretical complexity.
3. Compare the final complexity with the Ideal Complexity. Is the solution optimal?
4. Write a plain language explanation of WHY the code has this complexity (e.g., "The nested for-loop over the array gives O(N^2) time. No extra space is allocated so space is O(1).").

Respond ONLY with a valid JSON object in the following format:
{
  "final_time_complexity": "O(...)",
  "final_space_complexity": "O(...)",
  "is_optimal": true/false,
  "explanation": "Plain language explanation here...",
  "feedback": "Concise summary of optimality (e.g., 'Optimal time but could save space' or 'Correct but too slow (O(N^2))')"
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

    const result = JSON.parse(response.text);
    return {
      is_optimal: Boolean(result.is_optimal),
      feedback: result.feedback || "Evaluated.",
      ai_explanation: result.explanation || "",
      final_time: result.final_time_complexity || empiricalTime,
      final_space: result.final_space_complexity || empiricalSpace
    };
  } catch (error) {
    console.error("AI Complexity Evaluation Error:", error);
    return {
      is_optimal: false,
      feedback: "AI Evaluation Failed.",
      ai_explanation: error.message,
      final_time: empiricalTime,
      final_space: empiricalSpace
    };
  }
}

module.exports = {
  evaluateAnswer,
  evaluateCodeComplexity
};
