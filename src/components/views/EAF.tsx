import React from 'react';
import { ExternalLink, Database, Target, Lightbulb, Shield } from 'lucide-react';

const modules = [
  { name: 'Needs Assessment', icon: Target, desc: 'Survey-derived gap analysis feeds prioritized needs into EAF.', count: '12 active streams' },
  { name: 'Objectives & KPIs', icon: Lightbulb, desc: 'AI-recommended objectives mapped to sentiment & turnout deltas.', count: '47 objectives' },
  { name: 'Program Options', icon: Database, desc: 'Evidence-based intervention catalog auto-suggested per region.', count: '128 interventions' },
  { name: 'Security Planning', icon: Shield, desc: 'Risk zone heatmaps directly inform deployment of resources.', count: '23 hotspots' },
];

export const EAF: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Electoral Assessment Framework Integration</h1>
        <p className="text-sm text-muted-foreground">Survey insights flow directly into the Electoral Strategy Hub Platform.</p>
      </div>

      <div className="glass-card p-6 gradient-mesh">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-bold mb-2">Connected to Electoral Strategy Hub</h2>
            <p className="text-sm text-muted-foreground mb-4">Real-time bidirectional sync ensures field intelligence informs strategy, security planning, and capacity-building programs.</p>
            <a href="https://contact-planning-consult.deploypad.app/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition">
              Open Strategy Hub <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-emerald-600">98.7%</div>
              <div className="text-xs text-muted-foreground font-condensed uppercase">Sync uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(m => (
          <div key={m.name} className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                <m.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-base mb-1">{m.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{m.desc}</p>
                <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{m.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
