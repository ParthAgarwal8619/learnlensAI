import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { analyzeSyllabus } from '@/lib/ai-engine';
import { DEMO_TOPICS } from '@/lib/demo-data';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';

export function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState('Data Structures & Algorithms');
  const [examDate, setExamDate] = useState('');
  const [studyTime, setStudyTime] = useState('45');
  const [confidence, setConfidence] = useState('50');
  const [syllabusText, setSyllabusText] = useState('');
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ topicCount: number; topics: string[]; estimatedDuration: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSyllabusText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const loadDemoSyllabus = () => {
    setSyllabusText(`Data Structures & Algorithms - Course Syllabus

Module 1: Linear Structures
- Arrays: indexing, traversal, two-pointer technique, sliding window
- Linked Lists: singly, doubly, circular, cycle detection, reversal
- Stacks: LIFO operations, balanced parentheses, monotonic stacks
- Queues: FIFO operations, circular queue, priority queue, BFS

Module 2: Hierarchical Structures
- Trees: binary trees, BST, AVL trees, tree traversals, heap properties
- Graphs: adjacency matrix/list, BFS, DFS, Dijkstra's algorithm, MST

Module 3: Algorithms
- Sorting: merge sort, quick sort, heap sort, comparison-based analysis
- Searching: linear search, binary search, search in rotated arrays
- Hashing: hash functions, collision resolution, load factor, rehashing

Assessment: Final exam covering all topics with emphasis on trees and graphs.`);
    setFileName('demo-syllabus.txt');
  };

  const handleAnalyze = async () => {
    if (!syllabusText.trim()) {
      toast.error('Please upload a file or paste your syllabus text');
      return;
    }
    setAnalyzing(true);
    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 2000));
    const result = analyzeSyllabus(syllabusText);
    setAnalysisResult(result);
    setAnalyzing(false);
    toast.success(`AI detected ${result.topicCount} topics!`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Your Subject</h1>
        <p className="text-muted-foreground">Upload your syllabus and let AI analyze it for you</p>
      </div>

      {!analysisResult ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subject Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Name</Label>
                  <Input id="subject" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Data Structures & Algorithms" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input id="examDate" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studyTime">Daily Study Time (minutes)</Label>
                  <Input id="studyTime" type="number" value={studyTime} onChange={(e) => setStudyTime(e.target.value)} min="10" max="240" />
                </div>
                <div className="space-y-2">
                  <Label>Current Confidence Level</Label>
                  <Select value={confidence} onValueChange={setConfidence}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">Just starting (20%)</SelectItem>
                      <SelectItem value="40">Somewhat familiar (40%)</SelectItem>
                      <SelectItem value="50">Moderate (50%)</SelectItem>
                      <SelectItem value="70">Fairly confident (70%)</SelectItem>
                      <SelectItem value="85">Very confident (85%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Syllabus Content</CardTitle>
              <CardDescription>Upload a PDF/text file or paste your syllabus directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-accent hover:bg-accent/5">
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                          {fileName || 'Click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, TXT, or DOC</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Or Paste Text</Label>
                  <Textarea
                    placeholder="Paste your syllabus text here..."
                    className="min-h-[140px]"
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={loadDemoSyllabus} className="w-full gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Load Demo Syllabus
                  </Button>
                </div>
              </div>

              <Button onClick={handleAnalyze} disabled={analyzing} className="w-full gap-2" size="lg">
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is analyzing your syllabus...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze My Syllabus
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Analysis Complete</CardTitle>
                <CardDescription>AI detected {analysisResult.topicCount} topics from your syllabus</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 rounded-lg bg-accent/5 p-4">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium text-foreground">Estimated Study Duration</p>
                <p className="text-sm text-muted-foreground">{analysisResult.estimatedDuration}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-foreground">Detected Topics</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.topics.map((topic, i) => {
                  const demoTopic = DEMO_TOPICS.find((t) => t.name === topic);
                  const score = demoTopic?.masteryScore || 0;
                  return (
                    <Badge
                      key={i}
                      variant={score >= 80 ? 'default' : 'secondary'}
                      className={`gap-1.5 ${
                        score < 40 ? 'border-red-200 bg-red-50 text-red-700' :
                        score < 60 ? 'border-orange-200 bg-orange-50 text-orange-700' :
                        score < 80 ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                        'border-green-200 bg-green-50 text-green-700'
                      }`}
                    >
                      {topic}
                      <span className="text-xs opacity-70">{score}%</span>
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-2 font-semibold text-foreground">What happens next?</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">1</span>
                  Take a diagnostic test to assess your current knowledge
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">2</span>
                  View your knowledge map to see gaps
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">3</span>
                  Get a personalized 7-day learning plan
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => navigate('/app/diagnostic')} className="flex-1 gap-2" size="lg">
                <ClipboardCheck className="h-4 w-4" />
                Start Diagnostic Test
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/knowledge-map')} className="flex-1 gap-2" size="lg">
                View Knowledge Map
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
