import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl || typeof repoUrl !== 'string' || !repoUrl.trim()) {
    return res.status(400).json({ error: 'Repository URL is required.' });
  }

  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL. Use format: github.com/owner/repo' });
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };

    const response = await axios.get(apiUrl, { headers });
    const { content, encoding } = response.data;

    if (content && encoding === 'base64') {
      const buffer = Buffer.from(content, 'base64');
      const markdown = buffer.toString('utf-8');
      res.json({ readme: markdown });
    } else {
      res.status(500).json({ error: 'Failed to decode README content from GitHub.' });
    }

  } catch (error) {
    console.error('Error fetching from GitHub:', error.message);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'README not found for this repository.' });
    }
    res.status(500).json({ error: 'Failed to fetch README from GitHub.' });
  }
});

export default router;
