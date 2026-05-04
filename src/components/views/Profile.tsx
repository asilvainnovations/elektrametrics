import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Building2, Globe, Loader2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({ full_name: '', organization: '', country: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name || '',
      organization: profile.organization || '',
      country: profile.country || '',
    });
  }, [profile]);

  if (!profile) return <div className="glass-card p-12 text-center"><p>Sign in to view your profile.</p></div>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    toast({ title: 'Profile updated' });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your identity and credentials.</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div>
            <div className="font-display text-xl font-bold">{profile.full_name || profile.email}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{profile.email}</div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider font-condensed">
              <User className="w-3 h-3" />{profile.role}
            </div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Organization</Label>
              <Input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Country</Label>
              <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="gradient-primary text-white border-0">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </form>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-lg mb-3">Activity History</h2>
        <div className="space-y-2 text-sm">
          {[
            { action: 'Created survey "Q1 Voter Confidence"', time: '2 hours ago' },
            { action: 'Updated profile', time: '1 day ago' },
            { action: 'Exported regional sentiment report', time: '3 days ago' },
            { action: 'Joined ElektraMetrics', time: 'Member since signup' },
          ].map((a, i) => (
            <div key={i} className="flex justify-between p-2.5 rounded-lg bg-white/40 border border-white/30">
              <span>{a.action}</span>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
