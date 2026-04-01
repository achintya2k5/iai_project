import React, { useState, useEffect } from 'react';
import './index.css';

const ScoreGauge = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Color calculation based on score
  const getColor = (s) => {
    if (s < 30) return '#10b981'; // Green
    if (s < 70) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="score-section">
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="transparent"
            stroke={getColor(displayScore)}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 1s linear' }}
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: '800', display: 'block' }}>{Math.round(displayScore)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Score</span>
        </div>
      </div>
      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: getColor(displayScore) }}>
        {displayScore < 30 ? "Likely Accurate" : displayScore < 70 ? "Context Needed" : "Likely False"}
      </p>
    </div>
  );
};

function App() {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!claim.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: claim }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="hero">
        <h1>TruthLens AI</h1>
        <p>Advanced misinformation detection powered by Gemini 1.5 Flash. Enter any claim to verify its credibility.</p>
      </header>

      <main className="fact-check-box">
        <div className="input-container">
          <textarea
            placeholder="Paste a claim, news headline, or statement here..."
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button 
          className="check-button" 
          onClick={handleCheck} 
          disabled={loading || !claim.trim()}
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              <span>Analyzing Claim...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Instant Fact-Check</span>
            </>
          )}
        </button>

        {error && (
          <div style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            <span role="img" aria-label="error">⚠️</span> {error}
          </div>
        )}
      </main>

      {result && (
        <div className="result-card" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <ScoreGauge score={parseFloat(result.score || 0)} />
          
          <div className="details-section">
            <div>
              <span className="category-badge">{result.category || "General"}</span>
              <h2 style={{ marginTop: '0.5rem', fontSize: '1.5rem' }}>Assessment Results</h2>
            </div>

            <p className="explanation">
              {result.explanation}
            </p>

            {result.flags && result.flags.length > 0 && (
              <div className="flags">
                {result.flags.map((flag, idx) => (
                  <span key={idx} className="flag-tag">{flag}</span>
                ))}
              </div>
            )}

            <div className="tip-box">
              <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase' }}>💡 Credibility Tip</strong>
              {result.tip}
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 'auto', padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Built with &hearts; by Antigravity AI &bull; Powered by Gemini 1.5 Flash
      </footer>
    </div>
  );
}

export default App;
