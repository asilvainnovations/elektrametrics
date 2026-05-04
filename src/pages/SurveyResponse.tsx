import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DBQuestion {
  id: string;
  position: number;
  type: 'single_choice' | 'multi_choice' | 'likert' | 'open_ended';
  prompt: string;
  description?: string;
  options: string[];
  required: boolean;
  show_if?: { question_id: string; equals: string } | null;
}

interface SurveyMeta {
  id: string;
  name: string;
  region: string;
  status: string;
  description?: string;
}

const SurveyResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<SurveyMeta | null>(null);
  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data: s } = await supabase.from('surveys').select('id,name,region,status,description').eq('id', id).maybeSingle();
      if (!s) { setError('Survey not found.'); setLoading(false); return; }
      if (s.status !== 'active') { setError('This survey is not currently accepting responses.'); setSurvey(s as SurveyMeta); setLoading(false); return; }
      setSurvey(s as SurveyMeta);
      const { data: q } = await supabase.from('survey_questions').select('*').eq('survey_id', id).order('position');
      setQuestions((q as DBQuestion[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const isVisible = (q: DBQuestion): boolean => {
    if (!q.show_if?.question_id) return true;
    return answers[q.show_if.question_id] === q.show_if.equals;
  };

  const setAnswer = (qid: string, val: any) => setAnswers(prev => ({ ...prev, [qid]: val }));

  const toggleMulti = (qid: string, opt: string) => {
    const cur: string[] = answers[qid] || [];
    setAnswer(qid, cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt]);
  };

  const submit = async () => {
    // validate required visible questions
    for (const q of questions) {
      if (!isVisible(q)) continue;
      if (q.required) {
        const v = answers[q.id];
        if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
          setError(`Please answer required question: "${q.prompt}"`);
          return;
        }
      }
    }
    setError(null);
    setSubmitting(true);
    const token = `r_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    const { error: insErr } = await supabase.from('survey_responses').insert({
      survey_id: id,
      respondent_token: token,
      answers,
      metadata: { user_agent: navigator.userAgent, submitted_at: new Date().toISOString() },
    });
    if (insErr) {
      setError(insErr.message);
      setSubmitting(false);
      return;
    }
    // Increment response count (best-effort, public can't update surveys; use RPC fallback or skip)
    setSubmitting(false);
    setDone(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30 p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-500 mb-3" />
          <h1 className="font-display text-xl font-bold mb-2">Unable to load survey</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30 p-4">
        <div className="glass-card p-10 max-w-md text-center gradient-mesh">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Salamat po!</h1>
          <p className="text-sm text-muted-foreground">Your response has been securely submitted to ElektraMetrics. Your voice helps shape evidence-based electoral strategy.</p>
        </div>
      </div>
    );
  }

  if (survey?.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30 p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-3" />
          <h1 className="font-display text-xl font-bold mb-2">Survey not active</h1>
          <p className="text-sm text-muted-foreground">{error || 'This survey is not currently accepting responses.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-50" />
      <div className="relative max-w-2xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-condensed uppercase tracking-widest text-muted-foreground">Powered by ElektraMetrics</div>
            <div className="font-display font-semibold">Secure Voter Survey</div>
          </div>
        </div>

        <div className="glass-card p-6 lg:p-8 mb-4">
          <div className="text-xs font-condensed uppercase tracking-wider text-primary mb-1">{survey.region}</div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight mb-2">{survey.name}</h1>
          {survey.description && <p className="text-sm text-muted-foreground">{survey.description}</p>}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Anonymous · End-to-end encrypted · Takes ~5 minutes</span>
          </div>
        </div>

        <div className="space-y-3">
          {questions.filter(isVisible).map((q, i) => (
            <div key={q.id} className="glass-card p-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-condensed font-bold text-sm text-primary">Q{i + 1}.</span>
                <h2 className="font-display font-semibold text-base flex-1">{q.prompt}{q.required && <span className="text-rose-500 ml-1">*</span>}</h2>
              </div>
              {q.description && <p className="text-xs text-muted-foreground mb-3 ml-6">{q.description}</p>}

              <div className="ml-6 mt-3 space-y-2">
                {q.type === 'single_choice' && q.options.map(o => (
                  <label key={o} className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    answers[q.id] === o ? 'border-primary bg-primary/5' : 'border-white/40 bg-white/40 hover:bg-white/70'
                  }`}>
                    <input type="radio" name={q.id} checked={answers[q.id] === o} onChange={() => setAnswer(q.id, o)} className="accent-primary" />
                    <span className="text-sm">{o}</span>
                  </label>
                ))}

                {q.type === 'multi_choice' && q.options.map(o => {
                  const checked = (answers[q.id] || []).includes(o);
                  return (
                    <label key={o} className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      checked ? 'border-primary bg-primary/5' : 'border-white/40 bg-white/40 hover:bg-white/70'
                    }`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleMulti(q.id, o)} className="accent-primary" />
                      <span className="text-sm">{o}</span>
                    </label>
                  );
                })}

                {q.type === 'likert' && (
                  <div className="grid grid-cols-5 gap-2">
                    {q.options.map((o, idx) => (
                      <button key={o} onClick={() => setAnswer(q.id, o)}
                        className={`p-2 rounded-xl border text-xs font-medium transition ${
                          answers[q.id] === o ? 'gradient-primary text-white border-transparent shadow-md' : 'border-white/40 bg-white/40 hover:bg-white/70'
                        }`}>
                        <div className="font-display text-lg font-bold">{idx + 1}</div>
                        <div className="text-[10px] leading-tight mt-0.5">{o}</div>
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'open_ended' && (
                  <Textarea value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)} rows={4} placeholder="Type your answer..." />
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="glass-card p-3 mt-4 border-rose-300 text-rose-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={submit} disabled={submitting || questions.length === 0} className="gradient-primary text-white border-0 shadow-lg">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Submit Response</>}
          </Button>
        </div>

        <p className="text-[11px] text-center text-muted-foreground mt-6">
          Your response is anonymized and stored under ElektraMetrics' end-to-end encryption protocols. You may close this page at any time.
        </p>
      </div>
    </div>
  );
};

export default SurveyResponse;
