import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccessibility } from '@/contexts/accessibility-context';
import { generateTutorResponse } from '@/lib/ai-engine';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Sparkles,
  BookOpen,
  Lightbulb,
  GraduationCap,
  PenSquare,
  ListChecks,
  Volume2,
  RotateCcw,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'tutor';
  content: string;
}

const quickActions = [
  { label: 'Explain simply', icon: BookOpen, prompt: 'Explain binary trees simply' },
  { label: 'Give example', icon: Lightbulb, prompt: 'Give example', action: 'give example' },
  { label: 'Show analogy', icon: GraduationCap, prompt: 'Show analogy', action: 'show analogy' },
  { label: 'Quiz me', icon: PenSquare, prompt: 'Quiz me', action: 'quiz_me' },
  { label: 'Give practice', icon: ListChecks, prompt: 'Give me practice questions', action: 'give practice' },
  { label: 'Summarize', icon: Sparkles, prompt: 'Summarize', action: 'summarize' },
];

const suggestedQuestions = [
  'Explain binary trees simply',
  'What is the difference between BFS and DFS?',
  'How do hash tables work?',
  'Explain merge sort',
];

export function TutorPage() {
  const { user } = useAuth();
  const { speak, stopSpeaking } = useAccessibility();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'tutor',
      content: "Hi! I'm your AI tutor. I can explain data structures and algorithms concepts at your level. Ask me about binary trees, graphs, hash tables, sorting, or any topic from your syllabus. You can also use the quick action buttons below!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (query?: string, action?: string) => {
    const text = query || input;
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const response = generateTutorResponse(text, action);
    setMessages((prev) => [...prev, { role: 'tutor', content: response }]);
    setLoading(false);
  };

  const handleSpeak = (text: string) => {
    const plainText = text.replace(/[*#`]/g, '').replace(/\n/g, '. ');
    speak(plainText);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-4xl flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Tutor</h1>
        <p className="text-muted-foreground">Ask questions and get explanations at your level</p>
      </div>

      {/* Chat messages */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'tutor' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    {msg.role === 'tutor' && (
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => handleSend(action.prompt, action.action)}
            className="gap-1.5"
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask your AI tutor anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              handleSend();
            }
          }}
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
        <Button onClick={() => { stopSpeaking(); setMessages([messages[0]]); }} variant="outline" size="icon" title="Reset conversation">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
