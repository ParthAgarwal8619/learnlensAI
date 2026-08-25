import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/progress-ring';
import { getOrCreateDemoSubject, getTopics, getDiagnosticQuestions, saveDiagnosticAttempt, updateTopicMastery } from '@/lib/data-service';
import { getMasteryStatus } from '@/lib/demo-data';
import type { Subject, Topic, Question } from '@/lib/types';
import { toast } from 'sonner';
import {
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

type Phase = 'intro' | 'test' | 'results';

export function DiagnosticPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    overallScore: number;
    strongAreas: { name: string; score: number }[];
    weakAreas: { name: string; score: number }[];
    criticalGaps: { name: string; score: number }[];
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const subj = await getOrCreateDemoSubject(user.id);
      if (subj) {
        setSubject(subj);
        const t = await getTopics(subj.id);
        setTopics(t);
        const qs = await getDiagnosticQuestions(t.map((topic) => topic.id));
        setQuestions(qs);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleStart = () => {
    setPhase('test');
    setCurrentIdx(0);
    setAnswers({});
  };

  const handleAnswer = (questionId: string, answerIdx: number) => {
    setAnswers({ ...answers, [questionId]: answerIdx });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} remaining.`);
      setSubmitting(false);
      return;
    }

    // Calculate per-topic scores
    const topicScores: Record<string, { correct: number; total: number; topic: Topic }> = {};
    for (const q of questions) {
      if (!topicScores[q.topic_id]) {
        const topic = topics.find((t) => t.id === q.topic_id);
        if (!topic) continue;
        topicScores[q.topic_id] = { correct: 0, total: 0, topic };
      }
      topicScores[q.topic_id].total++;
      if (answers[q.id] === q.correct_answer) {
        topicScores[q.topic_id].correct++;
      }
    }

    const overallScore = Math.round(
      (Object.values(topicScores).reduce((sum, ts) => sum + (ts.correct / ts.total) * 100, 0) /
        Object.keys(topicScores).length) || 0
    );

    const scoredTopics = Object.values(topicScores).map((ts) => ({
      name: ts.topic.name,
      score: Math.round((ts.correct / ts.total) * 100),
      topicId: ts.topic.id,
    }));

    const strong = scoredTopics.filter((s) => s.score >= 80).sort((a, b) => b.score - a.score);
    const weak = scoredTopics.filter((s) => s.score >= 40 && s.score < 80).sort((a, b) => a.score - b.score);
    const critical = scoredTopics.filter((s) => s.score < 40).sort((a, b) => a.score - b.score);

    // Save attempt and update mastery
    if (user && subject) {
      await saveDiagnosticAttempt(user.id, subject.id, answers, overallScore);
      for (const st of scoredTopics) {
        await updateTopicMastery(user.id, st.topicId, subject.id, st.score);
      }
    }

    setResults({
      overallScore,
      strongAreas: strong,
      weakAreas: weak,
      criticalGaps: critical,
    });
    setPhase('results');
    setSubmitting(false);
    toast.success('Diagnostic complete!');
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading diagnostic test...</div></div>;
  }

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diagnostic Assessment</h1>
          <p className="text-muted-foreground">Test your current knowledge to identify gaps</p>
        </div>

        <Card>
          <CardContent className="space-y-6 p-8">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
                <ClipboardCheck className="h-10 w-10 text-accent" />
              </div>
            </div>

            <div className="space-y-4 text-center">
              <h2 className="text-xl font-semibold text-foreground">Ready to find your knowledge gaps?</h2>
              <p className="text-sm text-muted-foreground">
                This diagnostic test contains {questions.length} questions covering {topics.length} topics from your syllabus.
                Questions test understanding, not just memorization. Take your time — there's no time limit.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{questions.length}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{topics.length}</p>
                <p className="text-xs text-muted-foreground">Topics</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">~10</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">What happens after the test?</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>• Your mastery scores update for each topic</li>
                <li>• We identify your strong areas, weak areas, and critical gaps</li>
                <li>• A personalized learning plan is generated for you</li>
              </ul>
            </div>

            <Button onClick={handleStart} className="w-full gap-2" size="lg">
              Start Diagnostic Test
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'test' && questions.length > 0) {
    const currentQ = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const currentTopic = topics.find((t) => t.id === currentQ.topic_id);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Diagnostic Test</h1>
          <Badge variant="secondary">Question {currentIdx + 1} of {questions.length}</Badge>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>

        <Card>
          <CardHeader>
            {currentTopic && (
              <Badge variant="outline" className="mb-2 w-fit">
                {currentTopic.name}
              </Badge>
            )}
            <CardTitle className="text-lg leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQ.id, idx)}
                className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                  answers[currentQ.id] === idx
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:border-accent/50 hover:bg-muted/50'
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  answers[currentQ.id] === idx
                    ? 'bg-accent text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm text-foreground">{option}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button onClick={handleNext} disabled={answers[currentQ.id] === undefined} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Submit Test
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'results' && results) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Diagnostic Complete!</h1>
          <p className="text-muted-foreground">Here's what we found about your knowledge</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <ProgressRing
              progress={results.overallScore}
              size={180}
              strokeWidth={16}
              label={`${results.overallScore}%`}
              sublabel="Overall Mastery"
              color={
                results.overallScore < 40 ? 'hsl(0, 72%, 51%)' :
                results.overallScore < 60 ? 'hsl(25, 95%, 53%)' :
                results.overallScore < 80 ? 'hsl(45, 93%, 47%)' : 'hsl(142, 71%, 45%)'
              }
            />

            <div className="grid w-full gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600" />
                <p className="text-2xl font-bold text-green-700">{results.strongAreas.length}</p>
                <p className="text-xs text-green-600">Strong Areas</p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
                <AlertCircle className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                <p className="text-2xl font-bold text-orange-600">{results.weakAreas.length}</p>
                <p className="text-xs text-orange-600">Weak Areas</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <XCircle className="mx-auto mb-2 h-6 w-6 text-red-600" />
                <p className="text-2xl font-bold text-red-700">{results.criticalGaps.length}</p>
                <p className="text-xs text-red-600">Critical Gaps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {results.strongAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Strong Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.strongAreas.map((area, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/50 p-3">
                    <span className="font-medium text-foreground">{area.name}</span>
                    <Badge className="border-green-200 bg-green-100 text-green-700">{area.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {results.weakAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-orange-600">
                <AlertCircle className="h-5 w-5" />
                Weak Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.weakAreas.map((area, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-3">
                    <span className="font-medium text-foreground">{area.name}</span>
                    <Badge className="border-orange-200 bg-orange-100 text-orange-700">{area.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {results.criticalGaps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                <XCircle className="h-5 w-5" />
                Critical Gaps
              </CardTitle>
              <CardDescription>These topics need the most attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.criticalGaps.map((area, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3">
                    <span className="font-medium text-foreground">{area.name}</span>
                    <Badge className="border-red-200 bg-red-100 text-red-700">{area.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => navigate('/app/learning-plan')} className="flex-1 gap-2" size="lg">
            <TrendingUp className="h-4 w-4" />
            Generate Learning Plan
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/knowledge-map')} className="flex-1 gap-2" size="lg">
            View Knowledge Map
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
