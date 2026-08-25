import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/progress-ring';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getOrCreateDemoSubject, getTopics } from '@/lib/data-service';
import { DEMO_TOPICS, getMasteryStatus } from '@/lib/demo-data';
import type { Subject, Topic } from '@/lib/types';
import {
  Map,
  AlertCircle,
  ArrowRight,
  PenSquare,
  MessageSquare,
  BookOpen,
  TrendingDown,
} from 'lucide-react';

export function KnowledgeMapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading knowledge map...</div></div>;
  }

  const categories = [...new Set(topics.map((t) => t.category))];
  const selectedTopicData = selectedTopic ? DEMO_TOPICS.find((t) => t.name === selectedTopic.name) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Knowledge Map</h1>
        <p className="text-muted-foreground">Visualize your mastery across all topics</p>
      </div>

      {/* Summary bar */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Topics</p>
              <p className="text-2xl font-bold text-foreground">{topics.length}</p>
            </div>
            <Map className="h-8 w-8 text-accent" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Mastered</p>
              <p className="text-2xl font-bold text-green-600">{topics.filter((t) => t.mastery_score >= 80).length}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Developing</p>
              <p className="text-2xl font-bold text-yellow-600">{topics.filter((t) => t.mastery_score >= 60 && t.mastery_score < 80).length}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Critical Gaps</p>
              <p className="text-2xl font-bold text-red-600">{topics.filter((t) => t.mastery_score < 40).length}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Topic map by category */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics
                .filter((t) => t.category === category)
                .map((topic) => {
                  const status = getMasteryStatus(topic.mastery_score);
                  const color =
                    status === 'mastered' ? 'hsl(142, 71%, 45%)' :
                    status === 'developing' ? 'hsl(45, 93%, 47%)' :
                    status === 'weak' ? 'hsl(25, 95%, 53%)' : 'hsl(0, 72%, 51%)';
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-md hover:border-accent/50"
                    >
                      <ProgressRing
                        progress={topic.mastery_score}
                        size={64}
                        strokeWidth={6}
                        color={color}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{topic.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {status === 'critical' && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                          <span className={`text-xs font-medium ${
                            status === 'mastered' ? 'text-green-600' :
                            status === 'developing' ? 'text-yellow-600' :
                            status === 'weak' ? 'text-orange-500' : 'text-red-600'
                          }`}>
                            {status === 'mastered' ? 'Mastered' :
                             status === 'developing' ? 'Developing' :
                             status === 'weak' ? 'Weak' : 'Critical Gap'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Topic detail dialog */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTopic && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  {selectedTopic.name}
                  <Badge variant={selectedTopic.mastery_score >= 80 ? 'default' : 'secondary'} className={
                    selectedTopic.mastery_score < 40 ? 'border-red-200 bg-red-50 text-red-700' :
                    selectedTopic.mastery_score < 60 ? 'border-orange-200 bg-orange-50 text-orange-700' :
                    selectedTopic.mastery_score < 80 ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                    'border-green-200 bg-green-50 text-green-700'
                  }>
                    {getMasteryStatus(selectedTopic.mastery_score) === 'mastered' ? 'Mastered' :
                     getMasteryStatus(selectedTopic.mastery_score) === 'developing' ? 'Developing' :
                     getMasteryStatus(selectedTopic.mastery_score) === 'weak' ? 'Weak' : 'Critical Gap'}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedTopic.category}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex items-center justify-center">
                  <ProgressRing
                    progress={selectedTopic.mastery_score}
                    size={140}
                    strokeWidth={12}
                    label={`${selectedTopic.mastery_score}%`}
                    sublabel="Mastery"
                    color={
                      selectedTopic.mastery_score < 40 ? 'hsl(0, 72%, 51%)' :
                      selectedTopic.mastery_score < 60 ? 'hsl(25, 95%, 53%)' :
                      selectedTopic.mastery_score < 80 ? 'hsl(45, 93%, 47%)' : 'hsl(142, 71%, 45%)'
                    }
                  />
                </div>

                {selectedTopic.weak_concepts && selectedTopic.weak_concepts.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Weak Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.weak_concepts.map((c, i) => (
                        <Badge key={i} variant="secondary" className="border-red-200 bg-red-50 text-red-700">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTopicData && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                      <BookOpen className="h-4 w-4 text-accent" />
                      Recommended Lessons
                    </h4>
                    <ul className="space-y-2">
                      {selectedTopicData.recommendedLessons.map((lesson, i) => (
                        <li key={i} className="flex items-center gap-2 rounded-lg border p-2.5 text-sm">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">{i + 1}</span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={() => navigate('/app/tutor')} className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Ask AI Tutor
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/app/practice')} className="flex-1 gap-2">
                    <PenSquare className="h-4 w-4" />
                    Practice
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
