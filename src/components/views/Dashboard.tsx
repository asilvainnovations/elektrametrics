import React from 'react';
import { TrendingUp, Users, Target, AlertTriangle, ArrowUpRight, Activity, Map, Zap } from 'lucide-react';

const kpis = [
  { label: 'Active Surveys', value: '247', change: '+12%', icon: Activity, color: 'from-blue-600 to-blue-800' },
  { label: 'Total Responses', value: '1.2M', change: '+34%', icon: Users, color: 'from-emerald-600 to-emerald-800' },
  { label: 'Predicted Turnout', value: '67.4%', change: '+2.1%', icon: Target, color: 'from-orange-500 to-orange-700' },
  { label: 'Risk Zones', value: '23', change: '-4', icon: AlertTriangle, color: 'from-rose-600 to-rose-800' },
];

const sentimentTrends = [
  { region: 'NCR', sentiment: 72, change: +3.4, voters: '7.2M' },
  { region: 'Region IV-A (CALABARZON)', sentiment: 68, change: -1.2, voters: '9.8M' },
  { region: 'Region III (Central Luzon)', sentiment: 64, change: +2.8, voters: '7.4M' },
  { region: 'Region VII (Central Visayas)', sentiment: 71, change: +0.9, voters: '5.1M' },
  { region: 'Region XI (Davao)', sentiment: 76, change: +4.5, voters: '3.4M' },
  { region: 'BARMM', sentiment: 58, change: -2.1, voters: '2.8M' },
];

const insights = [
  { title: 'Declining trust among youth (18-24) in NCR', severity: 'high', delta: '-8.4%', context: 'Survey waves W12-W14' },
  { title: 'Rising civic engagement in Visayas barangays', severity: 'positive', delta: '+12.1%', context: 'Mobile + SMS channels' },
  { title: 'Vulnerable segments report low EAF awareness', severity: 'medium', delta: '34% gap', context: 'Cross-tab analysis' },
  { title: 'Turnout simulation: scenario B trending toward base', severity: 'medium', delta: 'p=0.71', context: 'ML predictive model' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden glass-card p-6 lg:p-10 gradient-mesh">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/50 mb-4">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-condensed uppercase tracking-wider font-semibold">Live Intelligence Feed</span>
          </div>
          <h1 className="font-display font-bold text-3xl lg:text-5xl leading-tight mb-3">
            <span className="text-gradient">Intelligence-Driven</span> Democracy
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
            AI-powered electoral surveys, geospatial sentiment heatmaps, and predictive turnout models — synthesizing 1.2M+ responses across barangay, municipality, and provincial layers.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="gradient-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
              Launch Survey <ArrowUpRight className="w-4 h-4" />
            </button>
            <button className="bg-white/70 backdrop-blur-md border border-white/50 px-5 py-2.5 rounded-xl font-medium hover:bg-white">View Live Map</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="glass-card p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center shadow-md`}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-condensed font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">{k.change}</span>
            </div>
            <div className="font-display text-3xl font-bold tracking-tight">{k.value}</div>
            <div className="text-xs text-muted-foreground font-condensed uppercase tracking-wider mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-lg">Regional Sentiment Index</h2>
              <p className="text-xs text-muted-foreground">Live aggregation across 17 administrative regions</p>
            </div>
            <Map className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {sentimentTrends.map(r => (
              <div key={r.region} className="flex items-center gap-4">
                <div className="w-44 flex-shrink-0">
                  <div className="text-sm font-medium truncate">{r.region}</div>
                  <div className="text-[11px] text-muted-foreground font-condensed">{r.voters} eligible voters</div>
                </div>
                <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${r.sentiment}%` }} />
                </div>
                <div className="w-12 text-right text-sm font-bold font-condensed">{r.sentiment}</div>
                <div className={`w-14 text-right text-xs font-medium ${r.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {r.change >= 0 ? '+' : ''}{r.change}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg">AI Insights</h2>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {insights.map((i, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/40 hover:bg-white/60 transition cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-medium leading-snug flex-1">{i.title}</div>
                  <span className={`text-[10px] font-bold uppercase font-condensed px-1.5 py-0.5 rounded ${
                    i.severity === 'high' ? 'bg-rose-100 text-rose-700' :
                    i.severity === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{i.severity}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{i.context}</span>
                  <span className="font-bold font-condensed">{i.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
