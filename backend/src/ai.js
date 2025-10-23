// src/ai.js
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

async function generateContent(prompt) {
  if (!prompt) throw new Error("Prompt must be provided");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
   contents: [
  `
You are a senior software engineer with 7+ years of experience.  
Your task is to review the following code and provide the output in a **clear, readable, and structured format**, exactly like this:

**Key Issues:**  
- Bullet point each problem with bullets.  
- Keep points short and precise.  

**Recommended Fix / Improvement:**  
- Bullet point each fix corresponding to the issue.  
- Keep suggestions concise and actionable.  
- Give corrected code 

**Quick Tip:**  
- Optional, 1 line max, practical tip.

Do NOT add greetings, explanations, or unrelated text. Only output the sections above.  

Code to review:
${prompt}
`
]
,
  });

  return response.text;
}

module.exports = generateContent;
