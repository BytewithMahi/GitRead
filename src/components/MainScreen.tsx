import { motion } from 'framer-motion';
import { Terminal, Send, Link, AlertCircle, Loader2, Wand2 } from 'lucide-react';
import { useState } from 'react';

export const MainScreen = ({
  onAnalyze,
  isAnalyzing = false,
  apiError = null
}: {
  onAnalyze: (content: string) => void;
  isAnalyzing?: boolean;
  apiError?: string | null;
}) => {
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'paste' | 'github' | 'generate'>('paste');
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for generation
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [techStack, setTechStack] = useState('');
  const [features, setFeatures] = useState('');

  const handleFetchReadme = async () => {
    if (!githubUrl.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const apiBase = 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: githubUrl })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch');

      if (data.readme) {
        onAnalyze(data.readme);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReadme = async () => {
    if (!projectName.trim() || !projectDesc.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const apiBase = 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, description: projectDesc, techStack, features })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate');

      if (data.readme) {
        setContent(data.readme);
        setActiveTab('paste');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-gravity-cyan to-transparent opacity-50" />

        {/* Futuristic SVG Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gravity-purple to-gravity-cyan opacity-25 blur-xl animate-pulse" />
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <path d="M20 35 C35 30, 45 30, 50 35 C55 30, 65 30, 80 35 V75 C65 70, 55 70, 50 75 C45 70, 35 70, 20 75 Z" fill="none" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 35 V75" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" />

            <motion.circle cx="35" cy="50" r="3" fill="#A855F7" animate={{ r: [3, 4, 3] }} transition={{ repeat: Infinity, duration: 2 }} />
            <motion.circle cx="65" cy="58" r="3" fill="#06B6D4" animate={{ r: [3, 4, 3] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
            <motion.circle cx="50" cy="45" r="4" fill="#FFFFFF" className="animate-ping" />

            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-5xl font-black md:tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gravity-cyan"
          >
            GitRead
          </motion.h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Analyze, enhance, and structure your GitHub README with futuristic intelligence.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-4 justify-center">
          {['paste', 'github', 'generate'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'paste' | 'github' | 'generate')}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${activeTab === tab
                ? 'bg-gravity-cyan/20 border border-gravity-cyan/40 text-gravity-cyan'
                : 'bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400'
                }`}
            >
              {tab === 'paste' ? 'Paste' : tab === 'github' ? 'GitHub' : 'Generate AI'}
            </button>
          ))}
        </div>

        {/* Input Container */}
        <motion.div className="relative group rounded-2xl border border-white/5 bg-black/30 p-4 transition-all duration-300 focus-within:border-gravity-cyan/40">
          <div className="flex items-center justify-between text-gray-500 mb-2 text-xs">
            <div className="flex items-center space-x-2">
              <Terminal size={14} className="text-gravity-cyan" />
              <span>{activeTab === 'paste' ? 'markdown_buffer.md' : activeTab === 'github' ? 'github_repo' : 'prompt_setup'}</span>
            </div>
            {(loading || isAnalyzing) && <Loader2 size={14} className="animate-spin text-gravity-cyan" />}
          </div>

          {activeTab === 'paste' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your README.md text content here..."
              className="w-full h-48 md:h-64 bg-transparent resize-none text-gray-200 placeholder-gray-600 focus:outline-none font-mono text-sm leading-relaxed"
            />
          ) : activeTab === 'github' ? (
            <div className="h-48 md:h-64 flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-md flex flex-col space-y-2">
                <label className="text-xs text-gray-400 flex items-center space-x-1">
                  <Link size={12} className="text-gravity-cyan" />
                  <span>Repository URL</span>
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="e.g., https://github.com/facebook/react"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-gravity-cyan/50 focus:outline-none text-white text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchReadme()}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 h-48 md:h-64 overflow-y-auto px-2">
              <input
                type="text"
                placeholder="Project Name *"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-gravity-cyan/50 focus:outline-none text-white text-sm"
              />
              <textarea
                placeholder="Description * (What does the app do?)"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 focus:border-gravity-cyan/50 focus:outline-none text-white text-sm rounded-xl resize-none"
              />
              <input
                type="text"
                placeholder="Tech Stack (e.g., React, Node, Tailwind)"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-gravity-cyan/50 focus:outline-none text-white text-sm"
              />
              <input
                type="text"
                placeholder="Key Features (comma separated)"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-gravity-cyan/50 focus:outline-none text-white text-sm"
              />
            </div>
          )}
          {(error || apiError) && (
            <div className="flex items-center space-x-2 text-red-400 text-xs mt-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
              <AlertCircle size={14} />
              <span>{error || apiError}</span>
            </div>
          )}
        </motion.div>

        {/* Action Button */}
        <motion.div className="flex justify-center mt-8">
          <button
            onClick={
              activeTab === 'paste'
                ? () => content.trim() && onAnalyze(content)
                : activeTab === 'github'
                  ? handleFetchReadme
                  : handleGenerateReadme
            }
            disabled={
              activeTab === 'paste' ? (!content.trim() || isAnalyzing) :
                activeTab === 'github' ? (!githubUrl.trim() || loading || isAnalyzing) :
                  (!projectName.trim() || !projectDesc.trim() || loading || isAnalyzing)
            }
            className="group relative px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-40"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gravity-purple to-gravity-cyan opacity-80 group-hover:opacity-100 blur-[2px]" />
            <div className="absolute inset-x-[1px] inset-y-[1px] rounded-[11px] bg-black/90 group-hover:bg-black/60" />

            <div className="relative flex items-center space-x-2">
              <span>{loading || isAnalyzing ? 'PROCESSING...' : activeTab === 'generate' ? 'GENERATE TEMPLATE' : 'ANALYZE'}</span>
              {!(loading || isAnalyzing) && (activeTab === 'generate' ? <Wand2 size={16} /> : <Send size={16} />)}
              {(loading || isAnalyzing) && <Loader2 size={16} className="animate-spin" />}
            </div>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
