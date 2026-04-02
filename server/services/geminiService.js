import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
    }
    this.ai = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');
    this.model = this.ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0,
      }
    });
  }

  async analyzeReadme(content) {
    const examplesPath = path.join(__dirname, 'examples.json');
    let examplesPrompt = '';

    try {
      if (fs.existsSync(examplesPath)) {
        const examples = JSON.parse(fs.readFileSync(examplesPath, 'utf8'));
        if (Array.isArray(examples) && examples.length > 0) {
          examplesPrompt = `
Here are some EXAMPLES of how to evaluate READMEs to match my preference:
${examples.map(ex => `
---
Example Input README:
"""
${ex.readme}
"""
Desired Output JSON:
${JSON.stringify(ex.analysis, null, 2)}
`).join('\n')}
---
`;
        }
      }
    } catch (e) {
      console.warn('Failed to load examples.json', e);
    }

    const prompt = `
You are an expert AI code reviewer. Analyze the following README.md file and provide structured feedback.
Evaluate it based on structure, clarity, installation guides, and visual assets.

Return a JSON object matching this schema EXACTLY:
{
  "score": number (0-10),
  "summary": "string (1-2 sentences)",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missing_sections": ["string"],
  "suggestions": ["string"]
}

Do not include any other text, markdown formatting, or explanation. Just the raw JSON.

${examplesPrompt}

README Content:
"""
${content}
"""
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('JSON Parse failed, attempting fallback repair:', parseError);
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
        throw new Error('Failed to parse AI response as JSON.');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}

export default new GeminiService();
