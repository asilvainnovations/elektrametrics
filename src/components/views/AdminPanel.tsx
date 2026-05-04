import React, { useEffect, useState } from 'react';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, Shield, Users, Loader2, History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface AuditEntry {
  id: string;
  target_email: string;
  old_role: string;
  new_role: string;
  admin_email: string;
  created_at: string;
}

export const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('role_audit_log').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    setProfiles((p as Profile[]) || []);
    setAudit((a as AuditEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (target: Profile, newRole: string) => {
    if (target.role === newRole) return;
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', target.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    await supabase.from('role_audit_log').insert({
      target_user_id: target.id,
      target_email: target.email,
      old_role: target.role,
      new_role: newRole,
      admin_id: profile!.id,
      admin_email: profile!.email,
    });
    toast({ title: 'Role updated', description: `${target.email} is now ${newRole}.` });
    load();
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="glass-card p-12 text-center">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="font-display text-xl font-semibold mb-2">Administrator access required</h2>
        <p className="text-sm text-muted-foreground">This panel is restricted to users with the admin role.</p>
      </div>
    );
  }

  const filtered = profiles.filter(p =>
    !search ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.organization?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    analyst: profiles.filter(p => p.role === 'analyst').length,
    officer: profiles.filter(p => p.role === 'officer').length,
    policymaker: profiles.filter(p => p.role === 'policymaker').length,
    admin: profiles.filter(p => p.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Administrator Panel</h1>
          <p className="text-sm text-muted-foreground">Manage user roles, organizations, and audit trail.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counts).map(([role, count]) => (
          <div key={role} className="glass-card p-4">
            <div className="text-[10px] font-condensed uppercase tracking-wider text-muted-foreground">{role}s</div>
            <div className="font-display text-3xl font-bold">{count}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, name, or org..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/60 border border-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <span className="text-sm text-muted-foreground"><Users className="w-4 h-4 inline mr-1" />{filtered.length} users</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-condensed uppercase tracking-wider text-muted-foreground border-b border-white/30">
                  <th className="p-3">Email / Name</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-white/20 hover:bg-white/30">
                    <td className="p-3">
                      <div className="font-medium">{u.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-3">{u.organization || '—'}</td>
                    <td className="p-3">{u.country || '—'}</td>
                    <td className="p-3">
                      <Select value={u.role} onValueChange={(v) => updateRole(u, v)}>
                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analyst">Analyst</SelectItem>
                          <SelectItem value="officer">Officer</SelectItem>
                          <SelectItem value="policymaker">Policymaker</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><History className="w-5 h-5" />Role Change Audit Log</h2>
        {audit.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No role changes recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {audit.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/30 text-sm">
                <div>
                  <div className="font-medium">{e.target_email}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-condensed bg-slate-200 px-1.5 py-0.5 rounded mr-1">{e.old_role}</span>→
                    <span className="font-condensed bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-1">{e.new_role}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>by {e.admin_email}</div>
                  <div>{new Date(e.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
