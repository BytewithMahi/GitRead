import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FloatingCard } from './FloatingCard';
import { CheckCircle, AlertTriangle, Lightbulb, FileWarning, ArrowLeft, BarChart2, Sparkles, Wand2, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface ReviewDashboardProps {
  content: string;
  analysis: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    missing_sections: string[];
    suggestions: string[];
  } | null;
  onBack: () => void;
}

export const ReviewDashboard = ({ content, analysis, onBack }: ReviewDashboardProps) => {
  const [improvedReadme, setImprovedReadme] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">No analysis data available.</div>
      </div>
    );
  }

  const handleImprove = async () => {
    setIsImproving(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readme: content })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to improve');

      if (data.readme) {
        setImprovedReadme(data.readme);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopy = () => {
    if (improvedReadme) {
      navigator.clipboard.writeText(improvedReadme);
      alert('Copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (improvedReadme) {
      const blob = new Blob([improvedReadme], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'IMPROVED_README.md';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Controls */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl glass-card hover:bg-white/5 border border-white/5 hover:border-gravity-cyan/30 text-gray-300 transition-all text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Editor</span>
        </button>

        <div className="flex items-center space-x-2">
          {!improvedReadme ? (
            <button
              onClick={handleImprove}
              disabled={isImproving}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gravity-purple to-gravity-cyan text-white hover:opacity-90 disabled:opacity-50 transition-all text-sm font-bold shadow-[0_0_15px_rgba(184,41,255,0.3)]"
            >
              <Sparkles size={16} className={isImproving ? 'animate-spin' : ''} />
              <span>{isImproving ? 'IMPROVING...' : 'IMPROVE WITH AI'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-gray-300"
              >
                <Copy size={14} />
                <span>Copy</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-gray-300"
              >
                <Download size={14} />
                <span>Download</span>
              </button>
              <button
                onClick={() => setImprovedReadme(null)}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-xs text-red-200"
              >
                Exit Comparison
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2 text-gravity-cyan px-4 py-2 rounded-xl glass-card border border-gravity-cyan/20">
            <BarChart2 size={16} />
            <span className="font-bold text-sm">Score: {analysis.score}/10</span>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-180px)] overflow-hidden">

        {/* Left Side Panel */}
        <motion.div
          className="glass-panel rounded-2xl flex flex-col h-full relative"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs text-gray-500">
            <span>{improvedReadme ? 'ORIGINAL README' : 'LIVE PREVIEW'}</span>
            <span>rendered_output.html</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 prose prose-invert prose-emerald max-w-none text-gray-300">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Right Side Panel */}
        <div className="overflow-y-auto pr-2 space-y-4 h-full">
          {improvedReadme ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-2xl flex flex-col h-full relative"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs text-gravity-cyan">
                <span className="flex items-center space-x-1"><Wand2 size={12} /> <span>AI IMPROVED VERSION</span></span>
                <span>comparison_output.md</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 prose prose-invert prose-cyan max-w-none text-gray-200 bg-cyan-900/5">
                <ReactMarkdown>{improvedReadme}</ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <>
              <FloatingCard
                title="Overview & Score"
                variant="purple"
                icon={<BarChart2 size={16} className="text-gravity-purple" />}
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-full border-4 border-gravity-purple flex items-center justify-center font-black text-xl text-white shadow-[0_0_15px_rgba(184,41,255,0.4)]">
                    {analysis.score}
                  </div>
                  <div>
                    <p className="font-bold text-white">Analysis Summary</p>
                    <p className="text-xs text-gray-400 mt-1">{analysis.summary}</p>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard
                title="Strengths"
                variant="green"
                icon={<CheckCircle size={16} className="text-green-500" />}
              >
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-xs">
                  {analysis.strengths.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </FloatingCard>

              <FloatingCard
                title="Weaknesses"
                variant="red"
                icon={<AlertTriangle size={16} className="text-red-500" />}
              >
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-xs">
                  {analysis.weaknesses.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </FloatingCard>

              <FloatingCard
                title="Actionable Suggestions"
                variant="cyan"
                icon={<Lightbulb size={16} className="text-gravity-cyan" />}
              >
                <ol className="list-decimal list-inside space-y-1 text-gray-400 text-xs">
                  {analysis.suggestions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              </FloatingCard>

              <FloatingCard
                title="Missing Standard Sections"
                variant="yellow"
                icon={<FileWarning size={16} className="text-yellow-500" />}
              >
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_sections.map((tag, index) => (
                    <span key={index} className="px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </FloatingCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
