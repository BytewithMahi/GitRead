import { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { Navbar } from './components/Navbar';
import { MainScreen } from './components/MainScreen';
import { ReviewDashboard } from './components/ReviewDashboard';

function App() {
  const [view, setView] = useState<'input' | 'dashboard'>('input');
  const [content, setContent] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAnalyze = async (text: string) => {
    setLoading(true);
    setError(null);
    setContent(text);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readme: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze README. Please check backend connection.');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <Background />
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

      <main>
        {view === 'input' ? (
          <MainScreen
            onAnalyze={handleAnalyze}
            isAnalyzing={loading}
            apiError={error}
          />
        ) : (
          <ReviewDashboard
            content={content}
            analysis={analysisResult}
            onBack={() => setView('input')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
