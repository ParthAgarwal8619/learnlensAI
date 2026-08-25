import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  FileText,
  Brain,
  Map,
  Calendar,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-primary">LearnLens AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Learning Platform
              </div>
              <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
                Learn smarter by finding{' '}
                <span className="text-accent">what you don't know.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                LearnLens AI analyzes your syllabus, identifies your knowledge gaps, and creates a personalized learning path that adapts as you improve.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full gap-2 sm:w-auto">
                    Start Learning
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                    <FileText className="h-4 w-4" />
                    Upload Syllabus
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  No credit card needed
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Demo available instantly
                </div>
              </div>
            </div>

            {/* Visual flow */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Card className="p-6 shadow-xl">
                <div className="space-y-4">
                  <FlowStep icon={FileText} label="Syllabus" description="Upload your course material" color="bg-blue-100 text-blue-700" />
                  <FlowArrow />
                  <FlowStep icon={Brain} label="AI Analysis" description="AI extracts topics & concepts" color="bg-purple-100 text-purple-700" />
                  <FlowArrow />
                  <FlowStep icon={Map} label="Knowledge Map" description="Visualize your mastery" color="bg-orange-100 text-orange-700" />
                  <FlowArrow />
                  <FlowStep icon={Calendar} label="Personalized Plan" description="7-day adaptive schedule" color="bg-green-100 text-green-700" />
                  <FlowArrow />
                  <FlowStep icon={GraduationCap} label="Mastery" description="Track your improvement" color="bg-primary text-white" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-foreground">How LearnLens AI Works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            A complete learning cycle that identifies gaps, guides your study, and adapts to your progress.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Map}
              title="Knowledge Gap Detection"
              description="Our diagnostic assessment pinpoints exactly which topics you understand and which need work."
            />
            <FeatureCard
              icon={MessageSquare}
              title="AI Tutor"
              description="Ask questions and get explanations at your level. The tutor adapts to your current understanding."
            />
            <FeatureCard
              icon={AlertCircle}
              title="Explain My Mistake"
              description="When you get something wrong, we explain why, identify the misconception, and generate similar questions."
            />
            <FeatureCard
              icon={Calendar}
              title="Adaptive Learning Plan"
              description="A 7-day plan that prioritizes your weakest topics and adjusts as your mastery improves."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Progress Analytics"
              description="Track mastery over time, accuracy, study time, and see exactly where you've improved."
            />
            <FeatureCard
              icon={Brain}
              title="Practice Mode"
              description="Targeted practice questions for your weak areas with instant feedback and concept explanations."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to find what you don't know?</h2>
          <p className="mt-3 text-muted-foreground">Start your personalized learning journey today.</p>
          <Link to="/register" className="mt-6 inline-block">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">LearnLens AI</span>
          </div>
          <p className="text-sm text-muted-foreground">Find what you don't know. Learn what matters.</p>
        </div>
      </footer>
    </div>
  );
}

function FlowStep({ icon: Icon, label, description, color }: { icon: any; label: string; description: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="ml-5 h-6 w-px bg-border" />
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card className="p-6 transition-shadow hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
