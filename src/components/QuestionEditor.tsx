import React, { useState } from 'react';
import { Trash2, GripVertical, Plus, X, AlignLeft, ListChecks, CheckSquare, BarChart2, GitBranch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export interface Question {
  id: string;
  type: 'single_choice' | 'multi_choice' | 'likert' | 'open_ended';
  prompt: string;
  description?: string;
  options: string[];
  required: boolean;
  position: number;
  show_if?: { question_id: string; equals: string } | null;
}

const TYPE_META: Record<Question['type'], { label: string; icon: any; color: string }> = {
  single_choice: { label: 'Single Choice', icon: ListChecks, color: 'bg-blue-100 text-blue-700' },
  multi_choice: { label: 'Multi Choice', icon: CheckSquare, color: 'bg-emerald-100 text-emerald-700' },
  likert: { label: 'Likert (5-pt)', icon: BarChart2, color: 'bg-orange-100 text-orange-700' },
  open_ended: { label: 'Open Ended', icon: AlignLeft, color: 'bg-slate-200 text-slate-700' },
};

const LIKERT = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

interface Props {
  question: Question;
  index: number;
  total: number;
  allQuestions: Question[];
  onChange: (q: Question) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragging: boolean;
}

export const QuestionEditor: React.FC<Props> = ({ question, index, total, allQuestions, onChange, onDelete, onDragStart, onDragOver, onDrop, isDragging }) => {
  const [showLogic, setShowLogic] = useState(!!question.show_if);
  const meta = TYPE_META[question.type];
  const Icon = meta.icon;

  const setType = (type: Question['type']) => {
    const opts = type === 'likert' ? LIKERT : type === 'open_ended' ? [] : (question.options.length ? question.options : ['Option 1', 'Option 2']);
    onChange({ ...question, type, options: opts });
  };

  const setOption = (i: number, val: string) => {
    const opts = [...question.options];
    opts[i] = val;
    onChange({ ...question, options: opts });
  };

  const addOption = () => onChange({ ...question, options: [...question.options, `Option ${question.options.length + 1}`] });
  const removeOption = (i: number) => onChange({ ...question, options: question.options.filter((_, idx) => idx !== i) });

  const priorQuestions = allQuestions.slice(0, index).filter(q => q.type === 'single_choice' || q.type === 'likert');

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`glass-card p-5 transition ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <button className="cursor-grab active:cursor-grabbing mt-2 text-muted-foreground hover:text-foreground" title="Drag to reorder">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-condensed font-bold text-sm text-muted-foreground w-7">Q{index + 1}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-condensed inline-flex items-center gap-1 ${meta.color}`}>
            <Icon className="w-3 h-3" /> {meta.label}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select value={question.type} onValueChange={(v) => setType(v as Question['type'])}>
            <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single_choice">Single Choice</SelectItem>
              <SelectItem value="multi_choice">Multi Choice</SelectItem>
              <SelectItem value="likert">Likert (5-pt)</SelectItem>
              <SelectItem value="open_ended">Open Ended</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-rose-100 text-rose-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 ml-8">
        <Input
          value={question.prompt}
          onChange={e => onChange({ ...question, prompt: e.target.value })}
          placeholder="Question prompt..."
          className="font-medium"
        />
        <Textarea
          value={question.description || ''}
          onChange={e => onChange({ ...question, description: e.target.value })}
          placeholder="Optional description / context for respondents"
          rows={2}
          className="text-sm"
        />

        {question.type === 'open_ended' && (
          <div className="p-3 rounded-xl bg-white/40 border border-dashed border-white/60 text-sm text-muted-foreground italic">
            Respondents will see a free-text input. AI sentiment analysis will be applied automatically.
          </div>
        )}

        {question.type === 'likert' && (
          <div className="flex gap-2 flex-wrap">
            {LIKERT.map(opt => (
              <span key={opt} className="px-3 py-1.5 rounded-lg bg-white/60 border border-white/40 text-xs font-condensed">{opt}</span>
            ))}
          </div>
        )}

        {(question.type === 'single_choice' || question.type === 'multi_choice') && (
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs font-condensed text-muted-foreground w-6">{i + 1}.</span>
                <Input value={opt} onChange={e => setOption(i, e.target.value)} className="flex-1" />
                <button onClick={() => removeOption(i)} className="p-1.5 rounded hover:bg-rose-100 text-rose-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption} className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add option
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-white/30">
          <div className="flex items-center gap-2">
            <Switch checked={question.required} onCheckedChange={(v) => onChange({ ...question, required: v })} />
            <span className="text-sm">Required</span>
          </div>
          {priorQuestions.length > 0 && (
            <button onClick={() => {
              setShowLogic(!showLogic);
              if (showLogic) onChange({ ...question, show_if: null });
            }} className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              showLogic ? 'bg-orange-100 text-orange-700' : 'bg-white/60 hover:bg-white/80 text-muted-foreground'
            }`}>
              <GitBranch className="w-3.5 h-3.5" /> {showLogic ? 'Logic enabled' : 'Add skip logic'}
            </button>
          )}
        </div>

        {showLogic && priorQuestions.length > 0 && (
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200/40 space-y-2">
            <div className="text-[11px] font-condensed font-semibold uppercase tracking-wider text-orange-700">Show this question only if:</div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={question.show_if?.question_id || ''}
                onValueChange={(v) => {
                  const target = priorQuestions.find(q => q.id === v);
                  onChange({ ...question, show_if: { question_id: v, equals: target?.options?.[0] || '' } });
                }}
              >
                <SelectTrigger className="h-8 text-xs flex-1 min-w-[180px]"><SelectValue placeholder="Select prior question" /></SelectTrigger>
                <SelectContent>
                  {priorQuestions.map(q => (
                    <SelectItem key={q.id} value={q.id}>Q{allQuestions.indexOf(q) + 1}: {q.prompt.slice(0, 40)}...</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="self-center text-xs font-condensed">equals</span>
              <Select
                value={question.show_if?.equals || ''}
                onValueChange={(v) => onChange({ ...question, show_if: { ...(question.show_if || { question_id: '' }), equals: v } })}
                disabled={!question.show_if?.question_id}
              >
                <SelectTrigger className="h-8 text-xs flex-1 min-w-[140px]"><SelectValue placeholder="answer" /></SelectTrigger>
                <SelectContent>
                  {(priorQuestions.find(q => q.id === question.show_if?.question_id)?.options || []).map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
