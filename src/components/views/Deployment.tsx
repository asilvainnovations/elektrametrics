import React from 'react';
import { Smartphone, MessageSquare, Globe, Send, Users, Wifi } from 'lucide-react';

const channels = [
  { name: 'Mobile Enumerator App', icon: Smartphone, active: 1247, sent: '124K', color: 'from-blue-600 to-blue-800', desc: 'Field enumerators with offline-first capture, GPS tagging, and biometric attendance.' },
  { name: 'SMS Survey', icon: MessageSquare, active: 8923, sent: '892K', color: 'from-emerald-600 to-emerald-800', desc: 'IVR-fallback SMS via Globe + Smart, optimized for low-bandwidth rural respondents.' },
  { name: 'Online Web Panel', icon: Globe, active: 4512, sent: '451K', color: 'from-orange-500 to-orange-700', desc: 'Quota-managed online panels with verified demographics and bot detection.' },
  { name: 'FB Messenger Bot', icon: Send, active: 6201, sent: '620K', color: 'from-indigo-600 to-indigo-800', desc: 'Conversational survey via Messenger, ideal for urban youth segments.' },
];

export const Deployment: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Multi-Channel Deployment Hub</h1>
        <p className="text-sm text-muted-foreground">Faster, cheaper, and more inclusive surveys via mobile, SMS, online, and Messenger channels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map(c => (
          <div key={c.name} className="glass-card p-6 hover:shadow-xl transition">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md`}>
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg">{c.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{c.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/30">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-condensed tracking-wider">Active sessions</div>
                <div className="font-display text-xl font-bold flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-500" />{c.active.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-condensed tracking-wider">Total reached</div>
                <div className="font-display text-xl font-bold">{c.sent}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Live Enumerator Tracking</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/40 border border-white/40">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-xs font-condensed font-semibold">EN-{1200 + i}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{['NCR','Cebu','Davao','Bicol','BARMM','Iloilo'][i % 6]}</div>
              <div className="font-condensed text-sm font-bold mt-1">{12 + (i * 3)} interviews</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
