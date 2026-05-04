import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun, Bell, Shield, Bot, Globe } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState({
    pushNotifs: true,
    emailNotifs: true,
    smsNotifs: false,
    aiSuggestions: true,
    twoFA: false,
    quietHours: true,
  });

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-lg">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const Row = ({ label, desc, value, onChange }: any) => (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/40 border border-white/30">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Personalize your ElektraMetrics experience.</p>
      </div>

      <Section title="Appearance" icon={theme === 'dark' ? Moon : Sun}>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border-2 transition ${theme === 'light' ? 'border-primary bg-white' : 'border-white/40 bg-white/40'}`}>
            <Sun className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-medium">Light</div>
          </button>
          <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border-2 transition ${theme === 'dark' ? 'border-primary bg-slate-900 text-white' : 'border-white/40 bg-white/40'}`}>
            <Moon className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-medium">Dark</div>
          </button>
        </div>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Row label="Push notifications" desc="Real-time alerts in-app" value={prefs.pushNotifs} onChange={(v: boolean) => setPrefs({ ...prefs, pushNotifs: v })} />
        <Row label="Email alerts" desc="Daily digest and critical events" value={prefs.emailNotifs} onChange={(v: boolean) => setPrefs({ ...prefs, emailNotifs: v })} />
        <Row label="SMS alerts" desc="Critical alerts only" value={prefs.smsNotifs} onChange={(v: boolean) => setPrefs({ ...prefs, smsNotifs: v })} />
        <Row label="Quiet hours (10pm - 7am)" desc="Pause non-critical alerts" value={prefs.quietHours} onChange={(v: boolean) => setPrefs({ ...prefs, quietHours: v })} />
      </Section>

      <Section title="Security" icon={Shield}>
        <Row label="Two-factor authentication" desc="Extra security for your account" value={prefs.twoFA} onChange={(v: boolean) => setPrefs({ ...prefs, twoFA: v })} />
        <div className="p-3 rounded-xl bg-white/40 border border-white/30">
          <div className="text-sm font-medium mb-1">Session timeout</div>
          <select className="w-full mt-1 px-3 py-2 rounded-lg bg-white/70 border border-white/40 text-sm">
            <option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>4 hours</option>
          </select>
        </div>
      </Section>

      <Section title="AI Assistant" icon={Bot}>
        <Row label="Enable AI suggestions in dashboard" desc="Show contextual recommendations from Elektra" value={prefs.aiSuggestions} onChange={(v: boolean) => setPrefs({ ...prefs, aiSuggestions: v })} />
      </Section>

      <Section title="Localization" icon={Globe}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Language</div>
            <select className="w-full px-3 py-2 rounded-lg bg-white/70 border border-white/40 text-sm">
              <option>English</option><option>Filipino</option><option>Cebuano</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Timezone</div>
            <select className="w-full px-3 py-2 rounded-lg bg-white/70 border border-white/40 text-sm">
              <option>Asia/Manila (UTC+8)</option><option>UTC</option>
            </select>
          </div>
        </div>
      </Section>
    </div>
  );
};
