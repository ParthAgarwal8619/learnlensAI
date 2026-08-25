import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrCreateDemoSubject, getTopics, getProgressData } from '@/lib/data-service';
import { getMasteryStatus } from '@/lib/demo-data';
import type { Subject, Topic, ProgressPoint } from '@/lib/types';
import {
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function ProgressPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const subj = await getOrCreateDemoSubject(user.id);
      if (subj) {
        setSubject(subj);
        const t = await getTopics(subj.id);
        setTopics(t);
        const p = await getProgressData(user.id, subj.id);
        setProgress(p);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading progress...</div></div>;
  }

  const mastered = topics.filter((t) => t.mastery_score >= 80);
  const weak = topics.filter((t) => t.mastery_score < 60);
  const critical = topics.filter((t) => t.mastery_score < 40);
  const overallMastery = topics.length > 0
    ? Math.round(topics.reduce((sum, t) => sum + t.mastery_score, 0) / topics.length)
    : 0;

  const topicChartData = topics.map((t) => ({
    name: t.name,
    mastery: t.mastery_score,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Progress Analytics</h1>
        <p className="text-muted-foreground">Track your learning journey and improvement over time</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Overall Mastery</p>
              <p className="text-2xl font-bold text-accent">{overallMastery}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Topics Mastered</p>
              <p className="text-2xl font-bold text-green-600">{mastered.length}/{topics.length}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Weak Areas</p>
              <p className="text-2xl font-bold text-orange-500">{weak.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Critical Gaps</p>
              <p className="text-2xl font-bold text-red-600">{critical.length}</p>
            </div>
            <Target className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Mastery Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mastery Over Time</CardTitle>
          <CardDescription>Your overall mastery progression</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progress}>
              <defs>
                <linearGradient id="masteryGrad" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="mastery" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#masteryGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Questions Solved */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Questions Solved</CardTitle>
            <CardDescription>Cumulative questions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="questions" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accuracy</CardTitle>
            <CardDescription>Your answer accuracy over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progress}>
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
                <Line type="monotone" dataKey="accuracy" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Study Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Study Time</CardTitle>
          <CardDescription>Minutes studied per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="study_time" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topic Progress</CardTitle>
          <CardDescription>Mastery score for each topic</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="mastery" radius={[0, 4, 4, 0]}>
                {topicChartData.map((entry, idx) => {
                  const status = getMasteryStatus(entry.mastery);
                  const fill =
                    status === 'mastered' ? 'hsl(142, 71%, 45%)' :
                    status === 'developing' ? 'hsl(45, 93%, 47%)' :
                    status === 'weak' ? 'hsl(25, 95%, 53%)' : 'hsl(0, 72%, 51%)';
                  return <rect key={idx} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weak & Strong Areas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600">
              <AlertCircle className="h-5 w-5" />
              Weak Areas
            </CardTitle>
            <CardDescription>Topics that need the most attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...topics].sort((a, b) => a.mastery_score - b.mastery_score).slice(0, 5).map((topic) => (
                <div key={topic.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">{topic.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          topic.mastery_score < 40 ? 'bg-red-500' :
                          topic.mastery_score < 60 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${topic.mastery_score}%` }}
                      />
                    </div>
                    <Badge variant="secondary" className={
                      topic.mastery_score < 40 ? 'border-red-200 bg-red-50 text-red-700' :
                      'border-orange-200 bg-orange-50 text-orange-700'
                    }>
                      {topic.mastery_score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Strong Areas
            </CardTitle>
            <CardDescription>Topics you've mastered well</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...topics].sort((a, b) => b.mastery_score - a.mastery_score).slice(0, 5).map((topic) => (
                <div key={topic.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">{topic.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${topic.mastery_score}%` }}
                      />
                    </div>
                    <Badge className="border-green-200 bg-green-50 text-green-700">
                      {topic.mastery_score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
