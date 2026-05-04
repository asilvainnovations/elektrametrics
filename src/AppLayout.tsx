import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/views/Dashboard';
import { Surveys } from '@/components/views/Surveys';
import { Analytics } from '@/components/views/Analytics';
import { GeoMap } from '@/components/views/GeoMap';
import { Deployment } from '@/components/views/Deployment';
import { Compare } from '@/components/views/Compare';
import { EAF } from '@/components/views/EAF';
import { Assistant } from '@/components/views/Assistant';
import { Notifications } from '@/components/views/Notifications';
import { AdminPanel } from '@/components/views/AdminPanel';
import { ProfileView } from '@/components/views/Profile';
import { SettingsView } from '@/components/views/Settings';

const AppLayout: React.FC = () => {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (view) {
      case 'surveys': return <Surveys />;
      case 'analytics': return <Analytics />;
      case 'geomap': return <GeoMap />;
      case 'deployment': return <Deployment />;
      case 'compare': return <Compare />;
      case 'eaf': return <EAF />;
      case 'assistant': return <Assistant />;
      case 'notifications': return <Notifications />;
      case 'admin': return <AdminPanel />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-60" />
      <div className="relative z-10">
        <Header onMenuClick={() => setSidebarOpen(true)} onNavigate={setView} />
        <div className="flex">
          <Sidebar active={view} onNavigate={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 min-w-0 p-4 lg:p-8">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
