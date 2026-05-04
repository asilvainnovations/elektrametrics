import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, FileText, Loader2, Smartphone, MessageSquare, Globe, Wand2, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SurveyBuilder } from '@/components/survey/SurveyBuilder';

interface Survey {
  id: string;
  name: string;
  region: string;
  target_sample: number;
  responses: number;
  status: 'draft' | 'active' | 'closed';
  description?: string;
  created_at: string;
}

const REGIONS = ['NCR', 'CAR', 'Region I (Ilocos)', 'Region II (Cagayan)', 'Region III (Central Luzon)', 'Region IV-A (CALABARZON)', 'Region IV-B (MIMAROPA)', 'Region V (Bicol)', 'Region VI (Western Visayas)', 'Region VII (Central Visayas)', 'Region VIII (Eastern Visayas)', 'Region IX (Zamboanga)', 'Region X (Northern Mindanao)', 'Region XI (Davao)', 'Region XII (SOCCSKSARGEN)', 'Region XIII (Caraga)', 'BARMM', 'Nationwide'];

export const Surveys: React.FC = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({ name: '', region: 'NCR', target_sample: 1000, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [building, setBuilding] = useState<Survey | null>(null);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('surveys').select('*').order('created_at', { ascending: false });
    setSurveys((data as Survey[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('surveys').insert({
      user_id: user.id,
      name: form.name,
      region: form.region,
      target_sample: form.target_sample,
      description: form.description,
      status: 'draft',
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Survey created', description: `${form.name} saved as draft.` });
      setOpen(false);
      setForm({ name: '', region: 'NCR', target_sample: 1000, description: '' });
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this survey? This cannot be undone.')) return;
    await supabase.from('surveys').delete().eq('id', id);
    toast({ title: 'Survey deleted' });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('surveys').update({ status }).eq('id', id);
    load();
  };

  const filtered = filter === 'all' ? surveys : surveys.filter(s => s.status === filter);
  const counts = {
    all: surveys.length,
    draft: surveys.filter(s => s.status === 'draft').length,
    active: surveys.filter(s => s.status === 'active').length,
    closed: surveys.filter(s => s.status === 'closed').length,
  };

  if (!user) {
    return (
      <div className="glass-card p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="font-display text-xl font-semibold mb-2">Sign in to manage surveys</h2>
        <p className="text-sm text-muted-foreground">Create your account to design, deploy, and analyze surveys.</p>
      </div>
    );
  }

  if (building) {
    return <SurveyBuilder survey={building} onClose={() => { setBuilding(null); load(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">My Surveys</h1>
          <p className="text-sm text-muted-foreground">Design, deploy, and monitor your electoral surveys.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gradient-primary text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />New Survey
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'draft', 'active', 'closed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f ? 'gradient-primary text-white shadow-md' : 'glass-card hover:bg-white/80'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} <span className="ml-1.5 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-semibold mb-1">No surveys yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first survey to begin gathering electoral intelligence.</p>
          <Button onClick={() => setOpen(true)} className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" />Create Survey
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => {
            const pct = Math.min(100, Math.round((s.responses / Math.max(1, s.target_sample)) * 100));
            return (
              <div key={s.id} className="glass-card p-5 hover:shadow-xl transition group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase font-condensed px-2 py-0.5 rounded-full ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'draft' ? 'bg-slate-200 text-slate-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{s.status}</span>
                      <span className="text-[10px] text-muted-foreground font-condensed">{s.region}</span>
                    </div>
                    <h3 className="font-display font-semibold text-base leading-tight truncate">{s.name}</h3>
                  </div>
                  <button onClick={() => remove(s.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {s.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-condensed">Responses</span>
                    <span className="font-bold font-condensed">{s.responses.toLocaleString()} / {s.target_sample.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-white/30">
                  <Button size="sm" variant="outline" onClick={() => setBuilding(s)} className="h-7 text-xs">
                    <Wand2 className="w-3 h-3 mr-1" />Build
                  </Button>
                  {s.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => setBuilding(s)} className="h-7 text-xs">
                      <BarChart3 className="w-3 h-3 mr-1" />Analytics
                    </Button>
                  )}
                  <div className="flex gap-1.5 text-muted-foreground ml-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <MessageSquare className="w-3.5 h-3.5" />
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v)}>
                    <SelectTrigger className="h-7 text-xs ml-auto w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Design New Survey</DialogTitle>
          </DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div>
              <Label>Survey Name</Label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q1 2026 Voter Confidence Wave" />
            </div>
            <div>
              <Label>Target Region</Label>
              <Select value={form.region} onValueChange={v => setForm({ ...form, region: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Sample Size</Label>
              <Input type="number" min={50} required value={form.target_sample} onChange={e => setForm({ ...form, target_sample: parseInt(e.target.value) || 0 })} />
              <p className="text-[11px] text-muted-foreground mt-1">AI will recommend stratification across age, class, and locality.</p>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Research objective, hypotheses, target population..." />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white border-0">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Survey'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
