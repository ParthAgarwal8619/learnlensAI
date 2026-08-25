import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/progress-ring';
import { getOrCreateDemoSubject, getTopics, getPracticeQuestions, recordPracticeAttempt, saveMistakeAnalysis, updateLearningPlan } from '@/lib/data-service';
import { getMasteryStatus } from '@/lib/demo-data';
import { explainMistake } from '@/lib/ai-engine';
import { useAccessibility } from '@/contexts/accessibility-context';
import type { Subject, Topic, Question, MistakeAnalysis } from '@/lib/types';
import { toast } from 'sonner';
import {
  PenSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  Volume2,
  Sparkles,
  BookOpen,
} from 'lucide-react';

type Phase = 'select' | 'question' | 'feedback' | 'mistake';

export function PracticePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { speak } = useAccessibility();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('select');
  const [loading, setLoading] = useState(true);
  const [loadingQ, setLoadingQ] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mistakeData, setMistakeData] = useState<MistakeAnalysis | null>(null);
  const [similarQuestions, setSimilarQuestions] = useState<Question[]>([]);
  const [similarQIdx, setSimilarQIdx] = useState(0);
  const [similarSelected, setSimilarSelected] = useState<number | null>(null);
  const [similarFeedback, setSimilarFeedback] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const subj = await getOrCreateDemoSubject(user.id);
      if (subj) {
        setSubject(subj);
        const t = await getTopics(subj.id);
        setTopics(t);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSelectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setLoadingQ(true);
    const qs = await getPracticeQuestions(topic.id);
    setQuestions(qs);
    if (qs.length > 0) {
      setCurrentQ(qs[0]);
    }
    setPhase('question');
    setLoadingQ(false);
  };

  const handleSubmit = async () => {
    if (!currentQ || selectedAnswer === null || !user || !subject) return;

    const correct = selectedAnswer === currentQ.correct_answer;
    setIsCorrect(correct);
    setTotalAnswered(totalAnswered + 1);

    await recordPracticeAttempt(user.id, currentQ, subject.id, selectedAnswer, correct);

    if (correct) {
      setCorrectCount(correctCount + 1);
    } else {
      // Generate mistake analysis
      const analysis = explainMistake(currentQ, selectedAnswer, selectedTopic?.name || '');
      setMistakeData(analysis);
      await saveMistakeAnalysis(user.id, currentQ, subject.id, analysis);
    }

    setPhase('feedback');
  };

  const handleExplainMistake = () => {
    setPhase('mistake');
  };

  const handleNextQuestion = () => {
    const idx = questions.findIndex((q) => q.id === currentQ?.id);
    if (idx < questions.length - 1) {
      setCurrentQ(questions[idx + 1]);
      setSelectedAnswer(null);
      setPhase('question');
    } else {
      // Loop back or show completion
      toast.success(`Practice session complete! ${correctCount}/${totalAnswered} correct`);
      setPhase('select');
      setCurrentQ(null);
      setSelectedAnswer(null);
      setCorrectCount(0);
      setTotalAnswered(0);
    }
  };

  const handleStartSimilar = () => {
    if (mistakeData && mistakeData.similar_questions.length > 0) {
      setSimilarQuestions(mistakeData.similar_questions);
      setSimilarQIdx(0);
      setSimilarSelected(null);
      setSimilarFeedback(null);
    }
  };

  const handleSubmitSimilar = () => {
    if (similarSelected === null || !similarQuestions[similarQIdx]) return;
    const correct = similarSelected === similarQuestions[similarQIdx].correct_answer;
    setSimilarFeedback(correct);
    if (correct) {
      setCorrectCount(correctCount + 1);
    }
    setTotalAnswered(totalAnswered + 1);
  };

  const handleNextSimilar = () => {
    if (similarQIdx < similarQuestions.length - 1) {
      setSimilarQIdx(similarQIdx + 1);
      setSimilarSelected(null);
      setSimilarFeedback(null);
    } else {
      // Done with similar questions, go to next original question
      setSimilarQuestions([]);
      setMistakeData(null);
      handleNextQuestion();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading practice...</div></div>;
  }

  // Phase: Select topic
  if (phase === 'select') {
    const weakTopics = [...topics].sort((a, b) => a.mastery_score - b.mastery_score);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Practice Mode</h1>
          <p className="text-muted-foreground">Choose a topic to practice — weakest topics are shown first</p>
        </div>

        {totalAnswered > 0 && (
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="flex items-center gap-4 p-4">
              <ProgressRing progress={Math.round((correctCount / totalAnswered) * 100)} size={64} strokeWidth={6} color="hsl(var(--accent))" />
              <div>
                <p className="font-medium text-foreground">Session Summary</p>
                <p className="text-sm text-muted-foreground">{correctCount} correct out of {totalAnswered} questions</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {weakTopics.map((topic) => {
            const status = getMasteryStatus(topic.mastery_score);
            return (
              <Card key={topic.id} className="cursor-pointer transition-all hover:shadow-md hover:border-accent/50" onClick={() => handleSelectTopic(topic)}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{topic.name}</h3>
                      <p className="text-xs text-muted-foreground">{topic.category}</p>
                    </div>
                    <ProgressRing
                      progress={topic.mastery_score}
                      size={56}
                      strokeWidth={5}
                      color={
                        status === 'mastered' ? 'hsl(142, 71%, 45%)' :
                        status === 'developing' ? 'hsl(45, 93%, 47%)' :
                        status === 'weak' ? 'hsl(25, 95%, 53%)' : 'hsl(0, 72%, 51%)'
                      }
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="secondary" className={
                      status === 'critical' ? 'border-red-200 bg-red-50 text-red-700' :
                      status === 'weak' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                      status === 'developing' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                      'border-green-200 bg-green-50 text-green-700'
                    }>
                      {status === 'mastered' ? 'Mastered' : status === 'developing' ? 'Developing' : status === 'weak' ? 'Weak' : 'Critical'}
                    </Badge>
                    <Button size="sm" className="gap-1.5">
                      Practice
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Phase: Question
  if (phase === 'question' && currentQ) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => { setPhase('select'); setSelectedAnswer(null); }} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{selectedTopic?.name}</Badge>
            <Badge variant="secondary">{currentQ.difficulty}</Badge>
          </div>
        </div>

        {totalAnswered > 0 && (
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-green-600 font-medium">{correctCount} correct</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{totalAnswered} answered</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(idx)}
                className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                  selectedAnswer === idx
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:border-accent/50 hover:bg-muted/50'
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  selectedAnswer === idx ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm text-foreground">{option}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleSubmit} disabled={selectedAnswer === null} className="w-full gap-2" size="lg">
          Submit Answer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Phase: Feedback
  if (phase === 'feedback' && currentQ) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className={isCorrect ? 'border-green-200' : 'border-red-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {isCorrect ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isCorrect ? 'Great job! You got it right.' : `The correct answer is ${String.fromCharCode(65 + currentQ.correct_answer)}: ${currentQ.options[currentQ.correct_answer]}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{currentQ.explanation}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Concept: {currentQ.concept}</Badge>
              <Badge variant="outline">Related: {currentQ.related_topic}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speak(currentQ.explanation)}
              className="mt-3 gap-1.5 text-muted-foreground"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Listen to explanation
            </Button>
          </CardContent>
        </Card>

        {/* Explain My Mistake CTA */}
        {!isCorrect && (
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Explain My Mistake</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Let AI analyze why your answer was wrong, identify the misconception, and generate similar questions to help you learn.
                  </p>
                  <Button onClick={handleExplainMistake} className="mt-3 gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Explain My Mistake
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={handleNextQuestion} variant="outline" className="flex-1 gap-2">
            Next Question
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setPhase('select'); setSelectedAnswer(null); }} variant="ghost">
            Back to Topics
          </Button>
        </div>
      </div>
    );
  }

  // Phase: Mistake Analysis
  if (phase === 'mistake' && mistakeData) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <AlertCircle className="h-6 w-6 text-accent" />
            Explain My Mistake
          </h1>
          <p className="text-muted-foreground">AI analysis of your incorrect answer</p>
        </div>

        {/* Question recap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{mistakeData.question_text}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
                <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-medium text-red-600">Your Answer</p>
                  <p className="text-sm text-foreground">{mistakeData.user_answer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-600">Correct Answer</p>
                  <p className="text-sm text-foreground">{mistakeData.correct_answer_text}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Misconception explanation */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-accent" />
              Why Your Answer Was Wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{mistakeData.misconception}</p>
            <div className="mt-4 rounded-lg border border-accent/20 bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">Misunderstood Concept</p>
              <p className="mt-1 text-sm font-medium text-foreground">{mistakeData.misunderstood_concept}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speak(mistakeData.misconception.replace(/[*#`]/g, ''))}
              className="mt-3 gap-1.5 text-muted-foreground"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Listen
            </Button>
          </CardContent>
        </Card>

        {/* Similar questions */}
        {similarQuestions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PenSquare className="h-5 w-5 text-accent" />
                Similar Questions
              </CardTitle>
              <CardDescription>3 questions to test your understanding of this concept</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStartSimilar} className="w-full gap-2" size="lg">
                <RotateCcw className="h-4 w-4" />
                Try Similar Questions
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Similar Question {similarQIdx + 1} of {similarQuestions.length}</CardTitle>
                <Badge variant="secondary">{similarQuestions[similarQIdx].difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium text-foreground">{similarQuestions[similarQIdx].question}</p>
              {similarQuestions[similarQIdx].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => similarFeedback === null && setSimilarSelected(idx)}
                  disabled={similarFeedback !== null}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    similarSelected === idx
                      ? similarFeedback === null
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : idx === similarQuestions[similarQIdx].correct_answer
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-400 bg-red-50'
                      : similarFeedback !== null && idx === similarQuestions[similarQIdx].correct_answer
                      ? 'border-green-400 bg-green-50'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    similarSelected === idx && similarFeedback === null ? 'bg-accent text-white' :
                    similarFeedback !== null && idx === similarQuestions[similarQIdx].correct_answer ? 'bg-green-500 text-white' :
                    similarSelected === idx && similarFeedback === false ? 'bg-red-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm text-foreground">{option}</span>
                  {similarFeedback !== null && idx === similarQuestions[similarQIdx].correct_answer && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                  )}
                  {similarFeedback === false && similarSelected === idx && (
                    <XCircle className="ml-auto h-4 w-4 text-red-600" />
                  )}
                </button>
              ))}

              {similarFeedback !== null && (
                <div className={`rounded-lg p-3 ${similarFeedback ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <p className="text-sm text-foreground">{similarQuestions[similarQIdx].explanation}</p>
                </div>
              )}

              {similarFeedback === null ? (
                <Button onClick={handleSubmitSimilar} disabled={similarSelected === null} className="w-full">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextSimilar} className="w-full gap-2">
                  {similarQIdx < similarQuestions.length - 1 ? 'Next Similar Question' : 'Continue Practice'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Button onClick={() => { setPhase('select'); setMistakeData(null); setSimilarQuestions([]); }} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Topics
        </Button>
      </div>
    );
  }

  return null;
}
