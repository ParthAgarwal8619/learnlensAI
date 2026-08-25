import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/progress-ring';
import { getOrCreateDemoSubject, getTopics, getDashboardStats, getProgressData } from '@/lib/data-service';
import { DEMO_TOPICS, getMasteryStatus } from '@/lib/demo-data';
import type { Subject, Topic, DashboardStats, ProgressPoint } from '@/lib/types';
import {
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Trophy,
  BookOpen,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progress, setProgress] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const subj = await getOrCreateDemoSubject(user.id);
      if (subj) {
        setSubject(subj);
        const t = await getTopics(subj.id);
        setTopics(t);
        const s = await getDashboardStats(user.id, subj.id);
        setStats(s);
        const p = await getProgressData(user.id, subj.id);
        setProgress(p);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    );
  }

  const biggestGap = [...topics].sort((a, b) => a.mastery_score - b.mastery_score)[0];
  const recentTopics = topics.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{subject?.name || 'Data Structures & Algorithms'}</p>
        </div>
        <Button onClick={() => navigate('/app/upload')} className="gap-2">
          <BookOpen className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Overall Mastery"
          value={`${stats?.overall_mastery || 72}%`}
          color="text-accent"
          bg="bg-accent/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Topics Mastered"
          value={`${stats?.topics_mastered || 18} / ${stats?.total_topics || 25}`}
          color="text-green-600"
          bg="bg-green-100"
        />
        <StatCard
          icon={Flame}
          label="Study Streak"
          value={`${stats?.study_streak || 7} days`}
          color="text-orange-500"
          bg="bg-orange-100"
        />
        <StatCard
          icon={Target}
          label="Questions Solved"
          value={`${stats?.questions_solved || 142}`}
          color="text-blue-600"
          bg="bg-blue-100"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overall Mastery Ring + Today's Goal */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <ProgressRing
              progress={stats?.overall_mastery || 72}
              size={160}
              strokeWidth={14}
              label={`${stats?.overall_mastery || 72}%`}
              sublabel="Overall Mastery"
            />
            <div className="w-full space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Today's Goal
                  </span>
                  <span className="font-medium">{stats?.today_completed_min || 20} / {stats?.today_goal_min || 45} min</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${((stats?.today_completed_min || 20) / (stats?.today_goal_min || 45)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  Knowledge Gaps
                </span>
                <span className="text-lg font-bold text-orange-600">{stats?.knowledge_gaps || 7}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mastery Over Time Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Mastery Over Time</CardTitle>
            <CardDescription>Your overall mastery progression over the past 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={progress}>
                <defs>
                  <linearGradient id="masteryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mastery"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#masteryGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Biggest Gap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Biggest Gap</CardTitle>
            <CardDescription>Focus on this topic to improve the fastest</CardDescription>
          </CardHeader>
          <CardContent>
            {biggestGap && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{biggestGap.name}</h3>
                    <p className="text-sm text-muted-foreground">{biggestGap.category}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      biggestGap.mastery_score < 40 ? 'text-red-600' :
                      biggestGap.mastery_score < 60 ? 'text-orange-500' :
                      biggestGap.mastery_score < 80 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {biggestGap.mastery_score}%
                    </div>
                    <span className="text-xs text-muted-foreground">{biggestGap.status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {biggestGap.weak_concepts?.map((c, i) => (
                    <span key={i} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                      {c}
                    </span>
                  ))}
                  {(!biggestGap.weak_concepts || biggestGap.weak_concepts.length === 0) && (
                    <span className="text-sm text-muted-foreground">No specific weak concepts identified yet.</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate('/app/tutor')} className="gap-1.5">
                    Get Help
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/app/practice')} className="gap-1.5">
                    Practice
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Learning Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Learning Plan</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/learning-plan')} className="gap-1 text-accent">
                View Full Plan
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topics
                .filter((t) => t.mastery_score < 60)
                .slice(0, 3)
                .map((topic, i) => {
                  const topicData = DEMO_TOPICS.find((t) => t.name === topic.name);
                  return (
                    <div key={topic.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{topic.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {topicData?.recommendedLessons[0] || 'Study session'} • {subject?.daily_study_time_min || 30} min
                        </p>
                      </div>
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        topic.mastery_score < 40 ? 'bg-red-500' :
                        topic.mastery_score < 60 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  );
                })}
              {topics.filter((t) => t.mastery_score < 60).length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Trophy className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  All topics are at developing level or above!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Topic Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/knowledge-map')} className="gap-1 text-accent">
              Open Knowledge Map
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTopics.map((topic) => {
              const status = getMasteryStatus(topic.mastery_score);
              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">{topic.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        status === 'mastered' ? 'text-green-600' :
                        status === 'developing' ? 'text-yellow-600' :
                        status === 'weak' ? 'text-orange-500' : 'text-red-600'
                      }`}>
                        {topic.mastery_score}%
                      </span>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${
                      status === 'mastered' ? 'bg-green-500' :
                      status === 'developing' ? 'bg-yellow-500' :
                      status === 'weak' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string; color: string; bg: string }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
