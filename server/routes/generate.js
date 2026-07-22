import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
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
    console.error('Error generating README:', error);
    const errMsg = error.message || '';
    if (errMsg.includes('API key') || errMsg.includes('quota') || errMsg.includes('limit') || errMsg.includes('429') || errMsg.includes('400')) {
      console.log('Falling back to simulated/mock README generation due to Gemini API key/quota issue.');
      const mockReadme = `# ${projectName}

${description}

---
> **Note**
> *This README was generated in Demo Mode because the backend's Gemini API key is invalid or rate-limited.*

## Tech Stack
${techStack ? techStack.split(',').map(t => `- ${t.trim()}`).join('\n') : '- JavaScript/Node.js'}

## Features
${features ? features.split(',').map(f => `- ${f.trim()}`).join('\n') : '- Clean code architecture\n- Easy integration\n- High performance'}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
// Example usage
import { start } from './index.js';

start();
\`\`\`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
MIT License
`;
      return res.json({ readme: mockReadme });
    }
    res.status(500).json({ error: `Failed to generate README: ${error.message}` });
  }
});

export default router;
