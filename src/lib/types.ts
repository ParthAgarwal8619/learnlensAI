export type MasteryStatus = 'mastered' | 'developing' | 'weak' | 'critical';

export interface Subject {
  id: string;
  name: string;
  exam_date: string | null;
  daily_study_time_min: number;
  current_confidence: number;
  status: string;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  category: string;
  mastery_score: number;
  status: MasteryStatus;
  weak_concepts: string[];
  recommended_lessons: string[];
  sort_order: number;
}

export interface Question {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  concept: string;
  related_topic: string;
  difficulty: string;
}

export interface DiagnosticResult {
  overall_score: number;
  strong_areas: { name: string; score: number }[];
  weak_areas: { name: string; score: number }[];
  critical_gaps: { name: string; score: number }[];
}

export interface LearningPlanDay {
  day: number;
  title: string;
  topic: string;
  topic_id: string;
  duration_min: number;
  type: 'study' | 'practice' | 'test' | 'reassessment';
  completed: boolean;
  description: string;
}

export interface LearningPlan {
  id: string;
  subject_id: string;
  days: LearningPlanDay[];
  version: number;
}

export interface MistakeAnalysis {
  question_text: string;
  user_answer: string;
  correct_answer_text: string;
  misconception: string;
  misunderstood_concept: string;
  similar_questions: Question[];
}

export interface DashboardStats {
  overall_mastery: number;
  topics_mastered: number;
  total_topics: number;
  study_streak: number;
  questions_solved: number;
  knowledge_gaps: number;
  today_goal_min: number;
  today_completed_min: number;
}

export interface ProgressPoint {
  date: string;
  mastery: number;
  questions: number;
  accuracy: number;
  study_time: number;
}
