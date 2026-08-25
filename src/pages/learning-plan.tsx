import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getOrCreateDemoSubject, getTopics, getOrCreateLearningPlan, updateLearningPlan, markPlanDayComplete } from '@/lib/data-service';
import type { Subject, Topic, LearningPlanDay } from '@/lib/types';
import { getAdaptivePlanUpdate } from '@/lib/ai-engine';
import { toast } from 'sonner';
import {
  Calendar,
  BookOpen,
  PenSquare,
  ClipboardCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const typeConfig = {
  study: { icon: BookOpen, color: 'bg-blue-100 text-blue-700', label: 'Study' },
  practice: { icon: PenSquare, color: 'bg-orange-100 text-orange-700', label: 'Practice' },
  test: { icon: ClipboardCheck, color: 'bg-purple-100 text-purple-700', label: 'Mock Test' },
  reassessment: { icon: RefreshCw, color: 'bg-green-100 text-green-700', label: 'Reassessment' },
};

export function LearningPlanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [plan, setPlan] = useState<LearningPlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const subj = await getOrCreateDemoSubject(user.id);
      if (subj) {
        setSubject(subj);
        const t = await getTopics(subj.id);
        setTopics(t);
        const p = await getOrCreateLearningPlan(user.id, subj.id, t, subj.daily_study_time_min);
        setPlan(p);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleAdaptPlan = async () => {
    if (!user || !subject) return;
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 1500));
    const newPlan = await updateLearningPlan(user.id, subject.id, topics, subject.daily_study_time_min);
    setPlan(newPlan);

    // Find the biggest change
    const weakest = [...topics].sort((a, b) => a.mastery_score - b.mastery_score)[0];
    if (weakest) {
      const msg = getAdaptivePlanUpdate(weakest.mastery_score, Math.min(weakest.mastery_score + 5, 100), weakest.name);
      setAdaptiveMessage(msg);
    }

    setUpdating(false);
    toast.success('Your plan has been updated based on your performance.');
  };

  const handleCompleteDay = async (day: number) => {
    if (!user || !subject) return;
    await markPlanDayComplete(user.id, subject.id, day);
    setPlan(plan.map((d) => (d.day === day ? { ...d, completed: true } : d)));
    toast.success(`Day ${day} completed!`);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading learning plan...</div></div>;
  }

  const completedDays = plan.filter((d) => d.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personalized Learning Plan</h1>
          <p className="text-muted-foreground">7-day adaptive plan prioritizing your weakest topics</p>
        </div>
        <Button onClick={handleAdaptPlan} disabled={updating} variant="outline" className="gap-2">
          {updating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {updating ? 'Adapting...' : 'Adapt Plan'}
        </Button>
      </div>

      {/* Adaptive message */}
      {adaptiveMessage && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex items-start gap-3 p-4">
            <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">{adaptiveMessage}</p>
              <p className="mt-1 text-xs text-muted-foreground">Your plan has been automatically adjusted.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan Progress</p>
              <p className="text-2xl font-bold text-foreground">{completedDays} / {plan.length} days completed</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {plan.reduce((sum, d) => sum + d.duration_min, 0)} min total
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${(completedDays / plan.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Day cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {plan.map((day, idx) => {
          const config = typeConfig[day.type];
          const Icon = config.icon;
          return (
            <Card
              key={day.day}
              className={`transition-all ${day.completed ? 'border-green-200 bg-green-50/30' : 'hover:shadow-md'}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">DAY {day.day}</span>
                        {day.completed && (
                          <Badge className="border-green-200 bg-green-100 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Done
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-0.5 font-semibold text-foreground">{day.title}</h3>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {day.duration_min}m
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{day.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="secondary" className="gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${config.color.split(' ')[0]}`} />
                    {config.label}
                  </Badge>
                  {!day.completed ? (
                    <Button size="sm" variant="outline" onClick={() => handleCompleteDay(day.day)} className="gap-1.5">
                      Mark Complete
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => navigate('/app/practice')} className="gap-1.5 text-accent">
                      Practice More
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Topic priority */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topic Priority</CardTitle>
          <CardDescription>Your plan focuses on these topics first</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...topics].sort((a, b) => a.mastery_score - b.mastery_score).map((topic, i) => (
              <div key={topic.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-foreground">{topic.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        topic.mastery_score < 40 ? 'bg-red-500' :
                        topic.mastery_score < 60 ? 'bg-orange-500' :
                        topic.mastery_score < 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${topic.mastery_score}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-foreground">{topic.mastery_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
