import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export const AuthModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', organization: '', country: 'Philippines' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = mode === 'signin'
      ? await signIn(form.email, form.password)
      : await signUp(form.email, form.password, { full_name: form.full_name, organization: form.organization, country: form.country });
    setLoading(false);
    if (res.error) {
      toast({ title: 'Authentication error', description: res.error, variant: 'destructive' });
    } else {
      toast({ title: mode === 'signin' ? 'Welcome back' : 'Account created', description: 'You are now signed in to ElektraMetrics.' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md border-white/40">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-display text-xl">
              {mode === 'signin' ? 'Sign in to ElektraMetrics' : 'Create your account'}
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">Government-grade analytics for electoral intelligence.</p>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div>
                <Label>Full Name</Label>
                <Input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Organization</Label>
                  <Input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
            </>
          )}
          <div>
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white border-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </Button>
          <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-sm text-primary w-full text-center hover:underline">
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
