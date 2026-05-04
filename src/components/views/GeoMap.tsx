import React, { useState } from 'react';
import { MapPin, Layers, Filter } from 'lucide-react';

const provinces = [
  { name: 'Metro Manila', x: 48, y: 38, sentiment: 72, voters: '7.2M', risk: 'low' },
  { name: 'Cebu', x: 56, y: 60, sentiment: 71, voters: '3.4M', risk: 'low' },
  { name: 'Davao', x: 70, y: 78, sentiment: 76, voters: '2.8M', risk: 'low' },
  { name: 'Iloilo', x: 48, y: 60, sentiment: 68, voters: '1.9M', risk: 'medium' },
  { name: 'Pampanga', x: 44, y: 32, sentiment: 64, voters: '1.7M', risk: 'medium' },
  { name: 'Cavite', x: 46, y: 42, sentiment: 70, voters: '2.5M', risk: 'low' },
  { name: 'Batangas', x: 48, y: 46, sentiment: 67, voters: '1.8M', risk: 'low' },
  { name: 'Pangasinan', x: 40, y: 26, sentiment: 62, voters: '2.0M', risk: 'medium' },
  { name: 'Cagayan', x: 50, y: 18, sentiment: 60, voters: '1.1M', risk: 'medium' },
  { name: 'Negros Occidental', x: 52, y: 64, sentiment: 65, voters: '1.7M', risk: 'medium' },
  { name: 'Maguindanao (BARMM)', x: 64, y: 84, sentiment: 58, voters: '0.9M', risk: 'high' },
  { name: 'Sulu', x: 58, y: 90, sentiment: 54, voters: '0.4M', risk: 'high' },
  { name: 'Bicol', x: 56, y: 50, sentiment: 66, voters: '3.2M', risk: 'medium' },
  { name: 'Cordillera', x: 42, y: 22, sentiment: 69, voters: '0.9M', risk: 'low' },
];

const granularity = ['National', 'Region', 'Province', 'Municipality', 'Barangay'];

const colorFor = (s: number) => s >= 70 ? '#059669' : s >= 65 ? '#3b82f6' : s >= 60 ? '#ea580c' : '#dc2626';

export const GeoMap: React.FC = () => {
  const [level, setLevel] = useState('Province');
  const [active, setActive] = useState<typeof provinces[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Geospatial Mapping</h1>
          <p className="text-sm text-muted-foreground">Drill down from national to barangay-level voter sentiment heatmaps.</p>
        </div>
        <div className="flex gap-2">
          <button className="glass-card px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Layers className="w-4 h-4" />Layers</button>
          <button className="glass-card px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Filter className="w-4 h-4" />Filters</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {granularity.map(g => (
          <button key={g} onClick={() => setLevel(g)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            level === g ? 'gradient-primary text-white shadow-md' : 'glass-card hover:bg-white/80'
          }`}>{g}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border border-white/40">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.15" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              <path d="M40,15 Q50,10 55,20 L60,30 L52,40 L48,50 L55,55 L50,65 L45,60 L42,50 L38,35 Z" fill="#cbd5e1" opacity="0.5" stroke="#64748b" strokeWidth="0.2" />
              <path d="M45,55 L60,65 L55,72 L48,68 Z" fill="#cbd5e1" opacity="0.5" stroke="#64748b" strokeWidth="0.2" />
              <path d="M58,72 Q70,75 75,85 L70,92 L60,88 L55,80 Z" fill="#cbd5e1" opacity="0.5" stroke="#64748b" strokeWidth="0.2" />
            </svg>

            {provinces.map(p => (
              <button key={p.name} onClick={() => setActive(p)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: colorFor(p.sentiment) }} />
                  <div className="relative w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: colorFor(p.sentiment) }} />
                </div>
                <div className="absolute left-5 top-0 opacity-0 group-hover:opacity-100 pointer-events-none transition glass-strong px-2 py-1 rounded-lg whitespace-nowrap text-[10px] font-condensed">
                  {p.name} · {p.sentiment}
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs mt-4">
            <span className="text-muted-foreground font-condensed uppercase tracking-wider">Sentiment scale:</span>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-600" />&lt;60</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500" />60-64</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" />65-69</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-600" />70+</div>
          </div>
        </div>

        <div className="space-y-4">
          {active ? (
            <div className="glass-card p-5">
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-lg">{active.name}</h3>
                  <p className="text-xs text-muted-foreground">{level} view</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-condensed tracking-wider">Sentiment</div>
                  <div className="font-display text-2xl font-bold" style={{ color: colorFor(active.sentiment) }}>{active.sentiment}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-condensed tracking-wider">Voters</div>
                  <div className="font-display text-2xl font-bold">{active.voters}</div>
                </div>
              </div>
              <div className={`px-3 py-2 rounded-xl text-xs font-medium ${
                active.risk === 'high' ? 'bg-rose-100 text-rose-700' :
                active.risk === 'medium' ? 'bg-orange-100 text-orange-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                Electoral risk: {active.risk}
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 text-center">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click a province pin to inspect.</p>
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Top Risk Zones</h3>
            <div className="space-y-2">
              {provinces.filter(p => p.risk !== 'low').sort((a, b) => a.sentiment - b.sentiment).slice(0, 5).map(p => (
                <button key={p.name} onClick={() => setActive(p)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/40 transition text-left">
                  <span className="text-sm">{p.name}</span>
                  <span className="text-xs font-condensed font-bold" style={{ color: colorFor(p.sentiment) }}>{p.sentiment}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
