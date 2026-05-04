import React from 'react';
import { Brain, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

const trendData = [
  { week: 'W1', sentiment: 64, turnout: 58 },
  { week: 'W2', sentiment: 66, turnout: 60 },
  { week: 'W3', sentiment: 65, turnout: 61 },
  { week: 'W4', sentiment: 68, turnout: 63 },
  { week: 'W5', sentiment: 70, turnout: 64 },
  { week: 'W6', sentiment: 69, turnout: 65 },
  { week: 'W7', sentiment: 72, turnout: 67 },
  { week: 'W8', sentiment: 71, turnout: 67 },
];

const scenarios = [
  { name: 'Base Case', turnout: 67.4, prob: 62, color: 'bg-blue-600' },
  { name: 'Mobilization Surge', turnout: 73.1, prob: 21, color: 'bg-emerald-600' },
  { name: 'Disengagement', turnout: 58.8, prob: 17, color: 'bg-orange-500' },
];

const sentimentTopics = [
  { topic: 'Economic Policy', positive: 42, neutral: 31, negative: 27 },
  { topic: 'Public Safety', positive: 51, neutral: 28, negative: 21 },
  { topic: 'Healthcare Access', positive: 38, neutral: 34, negative: 28 },
  { topic: 'Education Reform', positive: 56, neutral: 26, negative: 18 },
  { topic: 'Anti-Corruption', positive: 34, neutral: 22, negative: 44 },
  { topic: 'Climate & DRR', positive: 47, neutral: 35, negative: 18 },
];

export const Analytics: React.FC = () => {
  const max = Math.max(...trendData.map(d => Math.max(d.sentiment, d.turnout)));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">AI Analytics</h1>
        <p className="text-sm text-muted-foreground">Machine learning trend detection, predictive modeling & sentiment analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" />Sentiment & Turnout Trend</h2>
              <p className="text-xs text-muted-foreground">8-week rolling average · National</p>
            </div>
          </div>
          <div className="relative h-56">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1e40af" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1="0" x2="400" y1={200 - y * 1.8} y2={200 - y * 1.8} stroke="currentColor" strokeOpacity="0.08" />
              ))}
              <polygon fill="url(#g1)" points={`0,200 ${trendData.map((d, i) => `${(i * 400) / (trendData.length - 1)},${200 - (d.sentiment / max) * 180}`).join(' ')} 400,200`} />
              <polyline fill="none" stroke="#1e40af" strokeWidth="2.5" points={trendData.map((d, i) => `${(i * 400) / (trendData.length - 1)},${200 - (d.sentiment / max) * 180}`).join(' ')} />
              <polygon fill="url(#g2)" points={`0,200 ${trendData.map((d, i) => `${(i * 400) / (trendData.length - 1)},${200 - (d.turnout / max) * 180}`).join(' ')} 400,200`} />
              <polyline fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="4 3" points={trendData.map((d, i) => `${(i * 400) / (trendData.length - 1)},${200 - (d.turnout / max) * 180}`).join(' ')} />
              {trendData.map((d, i) => (
                <g key={i}>
                  <circle cx={(i * 400) / (trendData.length - 1)} cy={200 - (d.sentiment / max) * 180} r="3" fill="#1e40af" />
                  <circle cx={(i * 400) / (trendData.length - 1)} cy={200 - (d.turnout / max) * 180} r="3" fill="#059669" />
                </g>
              ))}
            </svg>
          </div>
          <div className="flex items-center gap-6 text-xs mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-700" />Sentiment Index</div>
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-emerald-600 border-dashed" />Predicted Turnout %</div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-emerald-600" />Turnout Scenario Simulation</h2>
              <p className="text-xs text-muted-foreground">Monte Carlo · 10K iterations</p>
            </div>
          </div>
          <div className="space-y-4">
            {scenarios.map(s => (
              <div key={s.name}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="font-condensed font-bold text-lg">{s.turnout}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.prob}%` }} />
                  </div>
                  <span className="text-xs font-condensed text-muted-foreground w-12 text-right">{s.prob}% prob</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50">
            <div className="flex gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">Base case is most likely. A 6-point sentiment lift in BARMM and Region V could shift probabilities toward Mobilization Surge.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-semibold text-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 text-orange-500" />Sentiment Analysis by Topic</h2>
            <p className="text-xs text-muted-foreground">NLP on open-ended responses · 84,219 verbatims classified</p>
          </div>
        </div>
        <div className="space-y-3">
          {sentimentTopics.map(t => (
            <div key={t.topic} className="flex items-center gap-4">
              <div className="w-40 flex-shrink-0 text-sm font-medium">{t.topic}</div>
              <div className="flex-1 flex h-7 rounded-lg overflow-hidden">
                <div className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${t.positive}%` }}>{t.positive}%</div>
                <div className="bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-700" style={{ width: `${t.neutral}%` }}>{t.neutral}%</div>
                <div className="bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${t.negative}%` }}>{t.negative}%</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs mt-4 text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" />Positive</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-300" />Neutral</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-500" />Negative</div>
        </div>
      </div>
    </div>
  );
};
