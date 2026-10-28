'use client';

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const presets = [
    { label: "🎓 1st-Year College Student", text: "I am an 18-year-old college fresher needing financial assistance for my tuition fees." },
    { label: "🛠️ Rural Artisan / Small Business", text: "I am a traditional artisan looking for collateral-free loans to expand my trade toolkit." },
    { label: "🏡 Low-Income Family", text: "Our family annual income is under 2.5 Lakhs and we need healthcare assistance." }
  ];

  const handleSearch = async (textToSearch: string) => {
    if (!textToSearch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSearch }),
      });
      const data = await res.json();
      if (data.matches) setResults(data.matches);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-blue-400">JanSeva AI</h1>
        <p className="text-slate-400 mt-2">AI-Powered Government Scheme Advisor</p>
      </header>

      {/* Preset Profiles */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-400 mb-2">Quick Demo Profiles (1-Click Presets):</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p.text);
                handleSearch(p.text);
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs py-2 px-3 rounded-lg transition cursor-pointer text-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-2 mb-8">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your current situation, income, or needs in plain English..."
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm text-white"
          rows={3}
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 px-6 font-semibold rounded-lg text-sm transition disabled:opacity-50 h-auto py-3 sm:py-0 cursor-pointer text-white"
        >
          {loading ? 'Analyzing...' : 'Find Schemes'}
        </button>
      </div>

      {/* Results Container */}
      <div className="space-y-4">
        {results.map((scheme, idx) => (
          <div key={idx} className="bg-slate-800 border border-slate-700 p-5 rounded-xl space-y-3">
            <h2 className="text-xl font-bold text-white">{scheme.schemeName}</h2>
            
            <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-sm p-3 rounded-lg">
              <strong>Why You Qualify:</strong> {scheme.whyEligible}
            </div>

            <p className="text-sm text-slate-300"><strong>Key Benefit:</strong> {scheme.keyBenefit}</p>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">3-Step Action Plan:</span>
              <ul className="list-disc list-inside text-xs text-slate-300 mt-1 space-y-1">
                {scheme.applicationSteps?.map((step: string, sIdx: number) => (
                  <li key={sIdx}>{step}</li>
                ))}
              </ul>
            </div>

            <a
              href={scheme.link}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-xs px-4 py-2 rounded font-medium transition mt-2 text-white"
            >
              Visit Official Portal →
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}