import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyze.js';
import githubRoutes from './routes/github.js';
import generateRoutes from './routes/generate.js';
import improveRoutes from './routes/improve.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/improve', improveRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'README Reviewer AI Backend is running' });
});

// Error Handling Middleware for uncaught errors
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
