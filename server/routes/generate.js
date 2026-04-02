import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

// @desc    Generate a complete README
// @route   POST /api/generate
router.post('/', async (req, res) => {
  const { projectName, description, techStack, features, includeBadges } = req.body;

  if (!projectName || !description) {
    return res.status(400).json({ error: 'Project name and description are required.' });
  }

  const prompt = `
You are an expert technical writer. Create a professional, complete, and attractive README.md file for the following project.

Project Name: ${projectName}
Description: ${description}
Tech Stack: ${techStack || 'Not specified'}
Key Features: ${features || 'Not specified'}
Include Badges: ${includeBadges ? 'Yes' : 'No'}

The README should include:
1. A catchy title and short description.
2. Badges for technology/license (if requested).
3. Clear **Features** list.
4. **Installation** steps.
5. **Usage** instructions with code snippets.
6. **Contributing** section.
7. **License** information.

Return ONLY the raw Markdown content. Do not include any JSON framing or extra commentary outside of the Markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Sometimes response contains markdown code blocks wrappers
    const cleanText = text.replace(/^```markdown\n/, '').replace(/\n```$/, '');

    res.json({ readme: cleanText });
  } catch (error) {
    console.error('Error generating README:', error);
    res.status(500).json({ error: 'Failed to generate README.' });
  }
});

export default router;
