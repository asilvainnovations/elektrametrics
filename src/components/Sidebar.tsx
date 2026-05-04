import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Map, BarChart3, Bot, Shield, Settings, Users, Bell, Send, Network, Database } from 'lucide-react';

interface Props { active: string; onNavigate: (v: string) => void; open: boolean; onClose: () => void; }

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'surveys', label: 'My Surveys', icon: FileText },
  { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
  { id: 'geomap', label: 'Geospatial Map', icon: Map },
  { id: 'deployment', label: 'Deployment Hub', icon: Send },
  { id: 'compare', label: 'Comparative Framework', icon: Network },
  { id: 'eaf', label: 'EAF Integration', icon: Database },
  { id: 'assistant', label: 'Elektra AI', icon: Bot },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const accountItems = [
  { id: 'profile', label: 'Profile', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<Props> = ({ active, onNavigate, open, onClose }) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" />}
      <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 z-50 lg:z-0 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full glass-strong border-r border-white/30 flex flex-col overflow-y-auto">
          <nav className="flex-1 p-3 space-y-0.5">
            <div className="px-3 py-2 text-[10px] font-condensed font-semibold uppercase tracking-widest text-muted-foreground">Workspace</div>
            {navItems.map(item => (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active === item.id ? 'gradient-primary text-white shadow-md' : 'hover:bg-white/50 dark:hover:bg-white/5 text-foreground/80'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}

            {isAdmin && (
              <>
                <div className="px-3 pt-4 pb-2 text-[10px] font-condensed font-semibold uppercase tracking-widest text-orange-600">Administration</div>
                <button onClick={() => { onNavigate('admin'); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active === 'admin' ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-orange-500/10 text-orange-600'
                  }`}>
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Admin Panel</span>
                </button>
              </>
            )}

            <div className="px-3 pt-4 pb-2 text-[10px] font-condensed font-semibold uppercase tracking-widest text-muted-foreground">Account</div>
            {accountItems.map(item => (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active === item.id ? 'gradient-primary text-white shadow-md' : 'hover:bg-white/50 dark:hover:bg-white/5 text-foreground/80'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3">
            <div className="glass-card p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full pulse-ring" />
                <span className="text-xs font-semibold">System Status</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">All AI models operational. Last sync 2 min ago.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
