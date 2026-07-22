import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

// @desc    Improve a README
// @route   POST /api/improve
router.post('/', async (req, res) => {
  const { readme } = req.body;

  if (!readme) {
    return res.status(400).json({ error: 'README content is required.' });
  }

  const prompt = `
You are an expert technical writer and code reviewer. Enhance, improve, and format the following README.md content.

Requirements:
1. Fix any spelling, punctuation, or grammar errors.
2. Structure layout with proper header tiers (# ## ###).
3. Ensure there are **Installation** and **Usage** guides setup accurately.
4. Add bullet points triggers and clear listings accurately mapped forwards.
5. If some sections (like license or setup descriptions) are fully missing, insert standard template content headers for them so user can edit.

Return ONLY the raw improved Markdown content. Do not include any HTML commentary outside of the Markdown.

Original README:
"""
${readme}
"""
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Improved extraction of markdown code blocks
    let cleanText = text;
    const markdownMatch = text.match(/```markdown\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (markdownMatch) {
      cleanText = markdownMatch[1];
    } else {
      // Fallback: just remove the wrappers if they are at the edges
      cleanText = text.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    }

    res.json({ readme: cleanText });
  } catch (error) {
    console.error('Error improving README:', error);
    const errMsg = error.message || '';
    if (errMsg.includes('API key') || errMsg.includes('quota') || errMsg.includes('limit') || errMsg.includes('429') || errMsg.includes('400')) {
      console.log('Falling back to simulated/mock README improvement due to Gemini API key/quota issue.');
      const mockImproved = `<!-- IMPROVED IN DEMO MODE (Gemini API key is invalid or rate-limited) -->

# Improved README

${readme}

---

## 💡 Suggestions for improvement
- Add more badges to your header.
- Provide step-by-step setup guides for development vs production.
- Document any environment variables required.
`;
      return res.json({ readme: mockImproved });
    }
    
    let message = error.message;
    if (message.includes('429') || message.includes('quota')) {
      message = 'Rate limit exceeded or quota full. Please wait a minute before trying again.';
    }
    res.status(500).json({ error: `Failed to improve README: ${message}` });
  }
});

export default router;
