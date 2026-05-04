import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Bot, Sparkles, Loader2 } from 'lucide-react';

interface Msg { role: 'user' | 'assistant'; content: string; }

const suggestions = [
  'Summarize the latest sentiment shift in BARMM',
  'How should I stratify a 1,200-respondent NCR sample?',
  'What are the top 3 turnout risk drivers this cycle?',
  'Generate a policy brief outline for youth voter engagement',
];

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hello — I am Elektra, your AI strategic advisor. Ask me about voter sentiment, sample design, turnout scenarios, or policy briefs.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'concise' | 'detailed'>('detailed');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('elektra-chat', {
        body: { messages: next.map(m => ({ role: m.role, content: m.content })), style }
      });
      if (error) throw error;
      setMessages([...next, { role: 'assistant', content: data?.reply || 'No response.' }]);
    } catch (e: any) {
      setMessages([...next, { role: 'assistant', content: 'Sorry, I encountered an error: ' + (e?.message || 'unknown') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-9rem)] flex flex-col">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            Elektra AI Assistant
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Strategic guidance powered by Gemini & Claude-class models.</p>
        </div>
        <div className="flex gap-1 glass-card p-1">
          {(['concise', 'detailed'] as const).map(s => (
            <button key={s} onClick={() => setStyle(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              style === s ? 'gradient-primary text-white shadow-sm' : 'hover:bg-white/40'
            }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                m.role === 'user' ? 'bg-orange-500' : 'gradient-primary'
              }`}>
                {m.role === 'user' ? <span className="text-white text-xs font-bold">U</span> : <Sparkles className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-2xl px-4 py-2.5 rounded-2xl ${
                m.role === 'user' ? 'bg-orange-500 text-white' : 'glass border border-white/40'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
              <div className="glass border border-white/40 px-4 py-2.5 rounded-2xl">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-white/50 hover:bg-white/80 border border-white/40 transition">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-white/30">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask Elektra anything about your data..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} className="gradient-primary text-white px-4 rounded-xl disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
