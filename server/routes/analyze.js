import express from 'express';
import geminiService from '../services/geminiService.js';

const router = express.Router();
const cache = new Map();

router.post('/', async (req, res) => {
  const { readme } = req.body;

  if (!readme) {
    return res.status(400).json({ error: 'README content is required.' });
  }

  // Check cache
  if (cache.has(readme)) {
    return res.json(cache.get(readme));
  }

  try {
    const analysis = await geminiService.analyzeReadme(readme);
    // Save to cache
    cache.set(readme, analysis);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({
      score: 0,
      summary: 'Analysis failed due to an error processing the request.',
      strengths: [],
      weaknesses: [],
      missing_sections: [],
      suggestions: ['Please try analyzing again.']
    });
  }
});

export default router;
