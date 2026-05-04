import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Sparkles, Plus, Loader2, Eye, Save, Wand2, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { QuestionEditor, Question } from './QuestionEditor';

interface Survey {
  id: string;
  name: string;
  region: string;
  target_sample: number;
  responses: number;
  status: 'draft' | 'active' | 'closed';
  description?: string;
}

interface Props {
  survey: Survey;
  onClose: () => void;
}

const STEPS = ['Basics', 'Questions', 'AI Suggestions', 'Review & Publish'];

const QUESTION_BANK: Omit<Question, 'id' | 'position'>[] = [
  { type: 'single_choice', prompt: 'Are you registered to vote in the upcoming election?', options: ['Yes, registered', 'No, not registered', 'Unsure'], required: true },
  { type: 'likert', prompt: 'I trust national government institutions to act in the public interest.', options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'], required: true },
  { type: 'likert', prompt: 'I trust local government units (LGUs) in my area.', options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'], required: false },
  { type: 'single_choice', prompt: 'How likely are you to vote on Election Day?', options: ['Definitely will vote','Probably will vote','Might or might not','Probably will not','Definitely will not'], required: true },
  { type: 'multi_choice', prompt: 'Which issues matter most to you this election? (select up to 3)', options: ['Economy & jobs','Inflation & prices','Public safety','Healthcare','Education','Anti-corruption','Climate & disaster resilience','Infrastructure'], required: false },
  { type: 'single_choice', prompt: 'Where do you primarily get election information?', options: ['Television','Radio','Facebook','TikTok','News websites','Family & friends','Community leaders'], required: false },
  { type: 'open_ended', prompt: 'In your own words, what is the most urgent issue your community faces?', options: [], required: false },
  { type: 'single_choice', prompt: 'Age group', options: ['18-24','25-34','35-44','45-54','55-64','65+'], required: true },
  { type: 'single_choice', prompt: 'Highest educational attainment', options: ['Elementary','High School','Vocational','College','Post-graduate'], required: false },
  { type: 'likert', prompt: 'Election results in my area are typically counted fairly.', options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'], required: false },
];

export const SurveyBuilder: React.FC<Props> = ({ survey, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Omit<Question, 'id' | 'position'>[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const newId = () => `q_${Math.random().toString(36).slice(2, 10)}`;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('survey_questions').select('*').eq('survey_id', survey.id).order('position');
      if (data) {
        setQuestions(data.map((d: any) => ({
          id: d.id,
          type: d.type,
          prompt: d.prompt,
          description: d.description,
          options: d.options || [],
          required: d.required,
          position: d.position,
          show_if: d.show_if,
        })));
      }
      setLoading(false);
    })();
  }, [survey.id]);

  const addQuestion = (template?: Omit<Question, 'id' | 'position'>) => {
    const base: Question = template
      ? { ...template, id: newId(), position: questions.length }
      : { id: newId(), type: 'single_choice', prompt: 'New question', options: ['Option 1', 'Option 2'], required: false, position: questions.length };
    setQuestions([...questions, base]);
  };

  const updateQuestion = (id: string, q: Question) => {
    setQuestions(questions.map(item => item.id === id ? q : item));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id).map((q, i) => ({ ...q, position: i })));
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const fromIdx = questions.findIndex(q => q.id === draggingId);
    const toIdx = questions.findIndex(q => q.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...questions];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setQuestions(next.map((q, i) => ({ ...q, position: i })));
    setDraggingId(null);
  };

  const fetchSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('survey-suggest', {
        body: {
          topic: survey.description || survey.name,
          region: survey.region,
          sample_size: survey.target_sample,
          existing_questions: questions.map(q => q.prompt),
        }
      });
      if (error) throw error;
      setSuggestions(data?.questions || []);
    } catch (e: any) {
      toast({ title: 'AI suggestion failed', description: e?.message, variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const acceptSuggestion = (s: Omit<Question, 'id' | 'position'>) => {
    addQuestion(s);
    setSuggestions(suggestions.filter(x => x !== s));
    toast({ title: 'Question added' });
  };

  const persist = async (newStatus?: 'draft' | 'active') => {
    if (!user) return;
    setSaving(true);
    // Replace all questions: delete then insert (simple, atomic enough for small N)
    await supabase.from('survey_questions').delete().eq('survey_id', survey.id);
    if (questions.length > 0) {
      const rows = questions.map((q, i) => ({
        survey_id: survey.id,
        user_id: user.id,
        position: i,
        type: q.type,
        prompt: q.prompt,
        description: q.description || null,
        options: q.options,
        required: q.required,
        show_if: q.show_if || null,
      }));
      const { error } = await supabase.from('survey_questions').insert(rows);
      if (error) {
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }
    if (newStatus) {
      await supabase.from('surveys').update({ status: newStatus }).eq('id', survey.id);
    }
    setSaving(false);
    toast({ title: newStatus === 'active' ? 'Survey published!' : 'Saved', description: newStatus === 'active' ? 'Your survey is now collecting responses.' : `${questions.length} questions saved.` });
    if (newStatus === 'active') onClose();
  };

  const publicUrl = `${window.location.origin}/survey/${survey.id}`;
  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({ title: 'Link copied', description: publicUrl });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-muted-foreground font-condensed uppercase tracking-wider">Survey Builder</div>
            <h1 className="font-display text-2xl font-bold">{survey.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => persist()} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save Draft</>}
          </Button>
          <Button onClick={() => persist('active')} disabled={saving || questions.length === 0} className="gradient-primary text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />Publish
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <button onClick={() => setStep(i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                step === i ? 'gradient-primary text-white shadow-md' : step > i ? 'text-emerald-700' : 'text-muted-foreground hover:bg-white/40'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === i ? 'bg-white/30' : step > i ? 'bg-emerald-100 text-emerald-700' : 'bg-white/60'
                }`}>{step > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}</span>
                {label}
              </button>
              {i < STEPS.length - 1 && <div className="h-px bg-white/40 flex-1 min-w-4" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Survey Basics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white/40 border border-white/30">
              <div className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">Name</div>
              <div className="font-display font-semibold mt-1">{survey.name}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/40 border border-white/30">
              <div className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">Region</div>
              <div className="font-display font-semibold mt-1">{survey.region}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/40 border border-white/30">
              <div className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">Target Sample</div>
              <div className="font-display font-semibold mt-1">{survey.target_sample.toLocaleString()}</div>
            </div>
          </div>
          {survey.description && (
            <div className="p-4 rounded-xl bg-white/40 border border-white/30">
              <div className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground mb-1">Objective</div>
              <p className="text-sm">{survey.description}</p>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setStep(1)} className="gradient-primary text-white border-0">Next: Build Questions <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-3">
            {questions.length === 0 && (
              <div className="glass-card p-12 text-center">
                <Wand2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-display font-semibold mb-1">Start building your survey</h3>
                <p className="text-sm text-muted-foreground mb-4">Add questions from the bank, create your own, or let AI suggest them.</p>
                <Button onClick={() => addQuestion()} className="gradient-primary text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />Add first question
                </Button>
              </div>
            )}
            {questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                question={q}
                index={i}
                total={questions.length}
                allQuestions={questions}
                onChange={(updated) => updateQuestion(q.id, updated)}
                onDelete={() => deleteQuestion(q.id)}
                onDragStart={() => setDraggingId(q.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(q.id)}
                isDragging={draggingId === q.id}
              />
            ))}
            {questions.length > 0 && (
              <button onClick={() => addQuestion()} className="w-full py-4 glass-card border-dashed border-2 border-white/50 hover:bg-white/60 transition flex items-center justify-center gap-2 text-sm font-medium">
                <Plus className="w-4 h-4" />Add Question
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div className="glass-card p-4 sticky top-20">
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />Question Bank
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3">Pre-validated templates. Click to insert.</p>
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                {QUESTION_BANK.map((tpl, i) => (
                  <button key={i} onClick={() => addQuestion(tpl)}
                    className="w-full text-left p-2.5 rounded-lg bg-white/40 hover:bg-white/70 border border-white/30 transition">
                    <div className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">{tpl.type.replace('_', ' ')}</div>
                    <div className="text-xs font-medium leading-tight mt-0.5">{tpl.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="glass-card p-6 gradient-mesh">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> AI-Powered Question Suggestions
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Elektra AI analyzes your region, sample size, and existing questions to suggest validated additions covering demographics, sentiment, and turnout drivers.
                </p>
              </div>
              <Button onClick={fetchSuggestions} disabled={aiLoading} className="gradient-primary text-white border-0">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Generate Suggestions</>}
              </Button>
            </div>
          </div>

          {suggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-condensed tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">{s.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug mb-3">{s.prompt}</p>
                  {s.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {s.options.map((o, oi) => (
                        <span key={oi} className="text-[11px] px-2 py-0.5 bg-white/60 border border-white/40 rounded-full">{o}</span>
                      ))}
                    </div>
                  )}
                  <Button size="sm" onClick={() => acceptSuggestion(s)} className="gradient-primary text-white border-0 w-full">
                    <Plus className="w-3 h-3 mr-1" />Add to Survey
                  </Button>
                </div>
              ))}
            </div>
          ) : !aiLoading ? (
            <div className="glass-card p-12 text-center text-sm text-muted-foreground">
              Click "Generate Suggestions" to receive AI-recommended questions.
            </div>
          ) : null}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <Button onClick={() => setStep(3)} className="gradient-primary text-white border-0">Next: Review <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />Review & Publish
            </h2>
            <p className="text-sm text-muted-foreground mb-5">Preview how respondents will see your survey, then publish to start collecting responses.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/40 border border-white/30">
                <div className="text-[10px] uppercase font-condensed text-muted-foreground">Questions</div>
                <div className="font-display text-2xl font-bold">{questions.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/40 border border-white/30">
                <div className="text-[10px] uppercase font-condensed text-muted-foreground">Required</div>
                <div className="font-display text-2xl font-bold">{questions.filter(q => q.required).length}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/40 border border-white/30">
                <div className="text-[10px] uppercase font-condensed text-muted-foreground">With Logic</div>
                <div className="font-display text-2xl font-bold">{questions.filter(q => q.show_if).length}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/40 border border-white/30">
                <div className="text-[10px] uppercase font-condensed text-muted-foreground">Open-Ended</div>
                <div className="font-display text-2xl font-bold">{questions.filter(q => q.type === 'open_ended').length}</div>
              </div>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {questions.map((q, i) => (
                <div key={q.id} className="p-3 rounded-xl bg-white/40 border border-white/30">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-condensed font-bold text-sm text-muted-foreground">Q{i + 1}.</span>
                    <span className="text-sm font-medium flex-1">{q.prompt}{q.required && <span className="text-rose-500 ml-1">*</span>}</span>
                    <span className="text-[10px] uppercase font-condensed text-muted-foreground">{q.type.replace('_', ' ')}</span>
                  </div>
                  {q.options.length > 0 && (
                    <div className="ml-6 mt-1 text-xs text-muted-foreground">{q.options.join(' · ')}</div>
                  )}
                  {q.show_if && (
                    <div className="ml-6 mt-1 text-[11px] text-orange-700 font-condensed">⤷ Shows only if Q{questions.findIndex(p => p.id === q.show_if!.question_id) + 1} = "{q.show_if.equals}"</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-2">Public Response Link</h3>
            <p className="text-xs text-muted-foreground mb-3">After publishing, share this link via SMS, Messenger, email, or QR code.</p>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-white/40 text-xs truncate">{publicUrl}</code>
              <Button variant="outline" size="sm" onClick={copyUrl}><Copy className="w-3.5 h-3.5 mr-1" />Copy</Button>
              <Button variant="outline" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1" />Preview</a>
              </Button>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => persist()} disabled={saving}>Save as Draft</Button>
              <Button onClick={() => persist('active')} disabled={saving || questions.length === 0} className="gradient-primary text-white border-0">
                <Sparkles className="w-4 h-4 mr-2" />Publish Survey
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};