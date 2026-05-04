import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Download, Loader2, BarChart3, MessageSquare, 
  FileText, ChevronDown, ChevronUp, Sparkles, Eye, X,
  PieChart, TrendingUp, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Question } from './QuestionEditor';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

interface Survey {
  id: string;
  name: string;
  region: string;
  target_sample: number;
  responses: number;
  status: 'draft' | 'active' | 'closed';
  description?: string;
}

interface ResponseRecord {
  id: string;
  survey_id: string;
  respondent_id: string;
  question_id: string;
  answer: string | string[];
  created_at: string;
}

interface AggregatedData {
  questionId: string;
  questionIndex: number;
  question: Question;
  totalResponses: number;
  breakdown: { label: string; count: number; percentage: number }[];
  openEndedAnswers: string[];
}

interface Props {
  survey: Survey;
  questions: Question[];
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const ResponseAnalytics: React.FC<Props> = ({ survey, questions, onClose }) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [expandedRespondent, setExpandedRespondent] = useState<string | null>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  useEffect(() => {
    loadResponses();
  }, [survey.id]);

  const loadResponses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', survey.id)
      .order('created_at', { ascending: false });
    setResponses(data || []);
    setLoading(false);
  };

  const aggregated = useMemo<AggregatedData[]>(() => {
    return questions.map((q, idx) => {
      const qResponses = responses.filter(r => r.question_id === q.id);
      const total = qResponses.length;

      if (q.type === 'open_ended') {
        return {
          questionId: q.id,
          questionIndex: idx,
          question: q,
          totalResponses: total,
          breakdown: [],
          openEndedAnswers: qResponses.map(r => String(r.answer)).filter(a => a.trim()),
        };
      }

      const counts: Record<string, number> = {};
      q.options.forEach(opt => counts[opt] = 0);

      qResponses.forEach(r => {
        const ans = Array.isArray(r.answer) ? r.answer : [String(r.answer)];
        ans.forEach(a => {
          if (counts[a] !== undefined) counts[a]++;
          else counts[a] = 1;
        });
      });

      const breakdown = Object.entries(counts)
        .map(([label, count]) => ({
          label,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        questionId: q.id,
        questionIndex: idx,
        question: q,
        totalResponses: total,
        breakdown,
        openEndedAnswers: [],
      };
    });
  }, [responses, questions]);

  const totalRespondents = useMemo(() => {
    return new Set(responses.map(r => r.respondent_id)).size;
  }, [responses]);

  const generateAiSummary = async () => {
    setAiLoading(true);
    try {
      const openEndedData = aggregated
        .filter(a => a.question.type === 'open_ended' && a.openEndedAnswers.length > 0)
        .map(a => ({
          question: a.question.prompt,
          answers: a.openEndedAnswers.slice(0, 50), // Limit for API
        }));

      if (openEndedData.length === 0) {
        setAiSummary('No open-ended responses available for analysis.');
        setAiLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('survey-analyze', {
        body: {
          survey_name: survey.name,
          region: survey.region,
          open_ended_responses: openEndedData,
        }
      });

      if (error) throw error;
      setAiSummary(data?.summary || 'Analysis completed. No significant patterns detected.');
    } catch (e: any) {
      toast({ title: 'AI analysis failed', description: e?.message, variant: 'destructive' });
      setAiSummary('Unable to generate AI summary at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Respondent ID', 'Submitted At', ...questions.map((q, i) => `Q${i + 1}: ${q.prompt}`)];

    const respondentGroups = responses.reduce((acc, r) => {
      if (!acc[r.respondent_id]) acc[r.respondent_id] = {};
      acc[r.respondent_id][r.question_id] = Array.isArray(r.answer) ? r.answer.join('; ') : r.answer;
      acc[r.respondent_id]._created_at = r.created_at;
      return acc;
    }, {} as Record<string, any>);

    const rows = Object.entries(respondentGroups).map(([respId, answers]) => {
      return [
        respId,
        answers._created_at,
        ...questions.map(q => answers[q.id] || ''),
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey.name.replace(/\s+/g, '_')}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported', description: `${rows.length} responses downloaded.` });
  };

  const getRespondentResponses = (respondentId: string) => {
    return responses.filter(r => r.respondent_id === respondentId);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-muted-foreground font-condensed uppercase tracking-wider">Response Analytics</div>
            <h1 className="font-display text-2xl font-bold">{survey.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={responses.length === 0}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
          <Button 
            onClick={generateAiSummary} 
            disabled={aiLoading || responses.length === 0}
            className="gradient-primary text-white border-0"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />AI Summary</>}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">Total Respondents</span>
          </div>
          <div className="font-display text-3xl font-bold">{totalRespondents.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">of {survey.target_sample.toLocaleString()} target</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">Total Answers</span>
          </div>
          <div className="font-display text-3xl font-bold">{responses.length.toLocaleString()}</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">Completion Rate</span>
          </div>
          <div className="font-display text-3xl font-bold">
            {totalRespondents > 0 ? Math.round((responses.length / (totalRespondents * questions.length)) * 100) : 0}%
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">Open-Ended</span>
          </div>
          <div className="font-display text-3xl font-bold">
            {aggregated.filter(a => a.question.type === 'open_ended').reduce((sum, a) => sum + a.openEndedAnswers.length, 0)}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="glass-card p-5 gradient-mesh">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">AI-Generated Insights</h3>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</div>
          <button onClick={() => setAiSummary('')} className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X className="w-3 h-3" /> Dismiss
          </button>
        </div>
      )}

      {/* Per-Question Charts */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Per-Question Breakdown
        </h2>

        {aggregated.map((data) => (
          <div key={data.questionId} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-condensed font-bold text-sm text-muted-foreground">Q{data.questionIndex + 1}.</span>
                  <span className="text-sm font-medium">{data.question.prompt}</span>
                  {data.question.required && <span className="text-rose-500 text-xs">*</span>}
                </div>
                <span className="text-[10px] uppercase font-condensed tracking-wider text-muted-foreground">
                  {data.question.type.replace('_', ' ')} · {data.totalResponses} responses
                </span>
              </div>
            </div>

            {data.question.type === 'open_ended' ? (
              <div className="space-y-2">
                {data.openEndedAnswers.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No responses yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {data.openEndedAnswers.slice(0, 30).map((answer, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1.5 rounded-full bg-white/60 border border-white/40 text-xs"
                        style={{ fontSize: `${Math.max(10, Math.min(16, 10 + (answer.length / 20)))}px` }}
                      >
                        {answer}
                      </span>
                    ))}
                    {data.openEndedAnswers.length > 30 && (
                      <span className="px-3 py-1.5 rounded-full bg-white/40 text-xs text-muted-foreground">
                        +{data.openEndedAnswers.length - 30} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.breakdown} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" />
                      <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {data.breakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={data.breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="label"
                      >
                        {data.breakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Distribution Table */}
            {data.question.type !== 'open_ended' && data.breakdown.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {data.breakdown.map((item, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/40 border border-white/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-condensed truncate" title={item.label}>{item.label}</span>
                    </div>
                    <div className="font-display font-bold text-lg">{item.count}</div>
                    <div className="text-[10px] text-muted-foreground">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Individual Response Drill-Down */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" /> Individual Responses
          </h2>
          <Button variant="outline" size="sm" onClick={() => setDrillDownOpen(!drillDownOpen)}>
            {drillDownOpen ? <><ChevronUp className="w-4 h-4 mr-1" />Hide</> : <><ChevronDown className="w-4 h-4 mr-1" />Show {totalRespondents} Responses</>}
          </Button>
        </div>

        {drillDownOpen && (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {Array.from(new Set(responses.map(r => r.respondent_id))).map(respId => {
              const respAnswers = getRespondentResponses(respId);
              const isExpanded = expandedRespondent === respId;
              const firstAnswer = respAnswers[0];

              return (
                <div key={respId} className="border border-white/30 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setExpandedRespondent(isExpanded ? null : respId)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/40 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold">{respId.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Respondent {respId.slice(-8)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {respAnswers.length} answers · {firstAnswer ? new Date(firstAnswer.created_at).toLocaleString() : ''}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 pt-0 space-y-2">
                      {questions.map((q, i) => {
                        const ans = respAnswers.find(r => r.question_id === q.id);
                        return (
                          <div key={q.id} className="flex gap-3 text-sm py-1 border-t border-white/20">
                            <span className="text-muted-foreground font-condensed w-8 shrink-0">Q{i + 1}</span>
                            <span className="flex-1 text-muted-foreground">{q.prompt}</span>
                            <span className="font-medium text-right max-w-[50%]">
                              {ans ? (Array.isArray(ans.answer) ? ans.answer.join(', ') : String(ans.answer)) : <span className="text-muted-foreground italic">No answer</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {totalRespondents === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No responses collected yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
