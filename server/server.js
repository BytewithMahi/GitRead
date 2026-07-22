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


// Error Handling Middleware for uncaught errors
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled Error at ${req.method} ${req.url}:`, err);
  
  // Provide more context for Gemini errors if possible
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ 
    error: message,
    path: req.url 
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
