import React from 'react';
import { Bell, AlertTriangle, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

const notifs = [
  { id: 1, type: 'critical', icon: AlertTriangle, title: 'Risk zone alert: BARMM sentiment fell 4.2%', time: '12 min ago', region: 'BARMM' },
  { id: 2, type: 'insight', icon: TrendingUp, title: 'New trend detected in youth (18-24) segment', time: '1 hour ago', region: 'NCR' },
  { id: 3, type: 'team', icon: Users, title: 'Enumerator team Davao-3 completed daily quota', time: '2 hours ago', region: 'Davao' },
  { id: 4, type: 'system', icon: CheckCircle2, title: 'Survey "Q1 Voter Confidence Wave" closed successfully', time: '4 hours ago', region: 'Nationwide' },
  { id: 5, type: 'insight', icon: TrendingUp, title: 'Predictive model updated — turnout forecast +1.2%', time: '8 hours ago', region: 'National' },
  { id: 6, type: 'critical', icon: AlertTriangle, title: 'Suspected duplicate responses flagged in Region V', time: '1 day ago', region: 'Region V' },
];

const colorFor = (t: string) => t === 'critical' ? 'from-rose-500 to-rose-700' : t === 'insight' ? 'from-emerald-500 to-emerald-700' : t === 'team' ? 'from-blue-500 to-blue-700' : 'from-slate-400 to-slate-600';

export const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Real-time alerts for critical risks, insights, and team updates.</p>
        </div>
      </div>

      <div className="glass-card divide-y divide-white/30">
        {notifs.map(n => (
          <div key={n.id} className="p-4 hover:bg-white/40 transition flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorFor(n.type)} flex items-center justify-center flex-shrink-0`}>
              <n.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>{n.time}</span>·<span className="font-condensed font-semibold">{n.region}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase font-condensed px-2 py-0.5 rounded-full ${
              n.type === 'critical' ? 'bg-rose-100 text-rose-700' :
              n.type === 'insight' ? 'bg-emerald-100 text-emerald-700' :
              n.type === 'team' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-200 text-slate-700'
            }`}>{n.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
