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
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0,
      }
    });
  }

  getMockAnalysis(content) {
    const lines = content.split('\n').length;
    const charCount = content.length;
    // Basic dynamic scoring based on simple metrics so it feels alive
    let score = 5;
    const strengths = [];
    const weaknesses = [];
    const missing_sections = [];
    const suggestions = [];

    if (charCount > 1000) {
      score += 1;
      strengths.push("Good length and detailed description.");
    } else {
      weaknesses.push("README content is quite short.");
      suggestions.push("Expand the README with more project details.");
    }

    if (content.toLowerCase().includes('install')) {
      score += 1;
      strengths.push("Includes installation instructions.");
    } else {
      missing_sections.push("Installation");
      suggestions.push("Add a step-by-step Installation guide.");
    }

    if (content.toLowerCase().includes('usage') || content.toLowerCase().includes('example')) {
      score += 1;
      strengths.push("Contains usage instructions or code examples.");
    } else {
      missing_sections.push("Usage");
      suggestions.push("Provide code examples showing how to use the project.");
    }

    if (content.toLowerCase().includes('license')) {
      score += 1;
      strengths.push("License information is specified.");
    } else {
      missing_sections.push("License");
      suggestions.push("Specify a license (e.g. MIT) for open source compliance.");
    }

    if (content.toLowerCase().includes('contributing') || content.toLowerCase().includes('contribute')) {
      score += 1;
      strengths.push("Includes a contribution guide.");
    } else {
      missing_sections.push("Contributing");
      suggestions.push("Add a Contributing section to encourage collaboration.");
    }

    score = Math.min(10, Math.max(1, score));

    return {
      score,
      summary: "[DEMO MODE] This is a simulated analysis because the configured Gemini API key is invalid or has exceeded its rate limit.",
      strengths: strengths.length > 0 ? strengths : ["Basic formatting and structure present."],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Could be expanded with advanced usage details."],
      missing_sections: missing_sections,
      suggestions: [
        "To get real AI analysis, configure a valid GEMINI_API_KEY in the server/.env file.",
        ...suggestions
      ]
    };
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
        // Try direct parse first
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('JSON Parse failed, attempting fallback repair:', parseError);
        // Find the first { and the last }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = text.substring(firstBrace, lastBrace + 1);
          return JSON.parse(jsonStr);
        }
        throw new Error('Failed to parse AI response as JSON.');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errMsg = error.message || '';
      if (errMsg.includes('API key') || errMsg.includes('quota') || errMsg.includes('limit') || errMsg.includes('429') || errMsg.includes('400')) {
        console.log('Falling back to simulated/mock analysis due to Gemini API key/quota issue.');
        return this.getMockAnalysis(content);
      }
      throw error;
    }
  }
}

export default new GeminiService();
