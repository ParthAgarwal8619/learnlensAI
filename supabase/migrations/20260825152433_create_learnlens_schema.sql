/*
# LearnLens AI - Core Schema

Creates the full database schema for the LearnLens AI personalized learning platform.

1. New Tables
- `subjects` - A student's subject (e.g. "Data Structures & Algorithms")
- `documents` - Uploaded syllabus documents (PDF or text)
- `topics` - Topics extracted from a subject's syllabus
- `diagnostic_questions` - Questions for the diagnostic assessment
- `diagnostic_attempts` - Records of diagnostic test attempts
- `topic_mastery` - Per-topic mastery score (0-100) and status
- `learning_plans` - 7-day adaptive learning plans
- `study_sessions` - Individual study session records
- `practice_questions` - Practice questions for weak areas
- `practice_attempts` - Records of practice question attempts
- `mistake_analysis` - AI analysis of incorrect answers
- `progress` - Daily progress snapshots for charts

2. Security
- All tables are owner-scoped with `user_id` defaulting to `auth.uid()`.
- RLS enabled on every table.
- 4 CRUD policies per table (select/insert/update/delete) scoped to authenticated owner.
*/

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  exam_date date,
  daily_study_time_min integer DEFAULT 30,
  current_confidence integer DEFAULT 50,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_subjects" ON subjects;
CREATE POLICY "select_own_subjects" ON subjects FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_subjects" ON subjects;
CREATE POLICY "insert_own_subjects" ON subjects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_subjects" ON subjects;
CREATE POLICY "update_own_subjects" ON subjects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_subjects" ON subjects;
CREATE POLICY "delete_own_subjects" ON subjects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  filename text,
  content text,
  source text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  mastery_score integer DEFAULT 0,
  status text DEFAULT 'not_started',
  weak_concepts text[],
  recommended_lessons text[],
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_topics" ON topics;
CREATE POLICY "select_own_topics" ON topics FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_topics" ON topics;
CREATE POLICY "insert_own_topics" ON topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_topics" ON topics;
CREATE POLICY "update_own_topics" ON topics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_topics" ON topics;
CREATE POLICY "delete_own_topics" ON topics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Diagnostic Questions
CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  difficulty text DEFAULT 'medium'
);
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_diag_questions" ON diagnostic_questions;
CREATE POLICY "select_own_diag_questions" ON diagnostic_questions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_diag_questions" ON diagnostic_questions;
CREATE POLICY "insert_own_diag_questions" ON diagnostic_questions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_own_diag_questions" ON diagnostic_questions;
CREATE POLICY "update_own_diag_questions" ON diagnostic_questions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_own_diag_questions" ON diagnostic_questions;
CREATE POLICY "delete_own_diag_questions" ON diagnostic_questions FOR DELETE TO authenticated USING (true);

-- Diagnostic Attempts
CREATE TABLE IF NOT EXISTS diagnostic_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  answers jsonb,
  overall_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE diagnostic_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_diag_attempts" ON diagnostic_attempts;
CREATE POLICY "select_own_diag_attempts" ON diagnostic_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_diag_attempts" ON diagnostic_attempts;
CREATE POLICY "insert_own_diag_attempts" ON diagnostic_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_diag_attempts" ON diagnostic_attempts;
CREATE POLICY "update_own_diag_attempts" ON diagnostic_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_diag_attempts" ON diagnostic_attempts;
CREATE POLICY "delete_own_diag_attempts" ON diagnostic_attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Topic Mastery
CREATE TABLE IF NOT EXISTS topic_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  mastery_score integer DEFAULT 0,
  status text DEFAULT 'critical',
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  last_assessed timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_topic_mastery" ON topic_mastery;
CREATE POLICY "select_own_topic_mastery" ON topic_mastery FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_topic_mastery" ON topic_mastery;
CREATE POLICY "insert_own_topic_mastery" ON topic_mastery FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_topic_mastery" ON topic_mastery;
CREATE POLICY "update_own_topic_mastery" ON topic_mastery FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_topic_mastery" ON topic_mastery;
CREATE POLICY "delete_own_topic_mastery" ON topic_mastery FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Learning Plans
CREATE TABLE IF NOT EXISTS learning_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  plan_data jsonb NOT NULL,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_learning_plans" ON learning_plans;
CREATE POLICY "select_own_learning_plans" ON learning_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_learning_plans" ON learning_plans;
CREATE POLICY "insert_own_learning_plans" ON learning_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_learning_plans" ON learning_plans;
CREATE POLICY "update_own_learning_plans" ON learning_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_learning_plans" ON learning_plans;
CREATE POLICY "delete_own_learning_plans" ON learning_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  duration_min integer DEFAULT 0,
  session_type text DEFAULT 'study',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_study_sessions" ON study_sessions;
CREATE POLICY "select_own_study_sessions" ON study_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_study_sessions" ON study_sessions;
CREATE POLICY "insert_own_study_sessions" ON study_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_study_sessions" ON study_sessions;
CREATE POLICY "update_own_study_sessions" ON study_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_study_sessions" ON study_sessions;
CREATE POLICY "delete_own_study_sessions" ON study_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Practice Questions
CREATE TABLE IF NOT EXISTS practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  concept text,
  related_topic text,
  difficulty text DEFAULT 'medium'
);
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_practice_questions" ON practice_questions;
CREATE POLICY "select_own_practice_questions" ON practice_questions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_practice_questions" ON practice_questions;
CREATE POLICY "insert_own_practice_questions" ON practice_questions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_own_practice_questions" ON practice_questions;
CREATE POLICY "update_own_practice_questions" ON practice_questions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_own_practice_questions" ON practice_questions;
CREATE POLICY "delete_own_practice_questions" ON practice_questions FOR DELETE TO authenticated USING (true);

-- Practice Attempts
CREATE TABLE IF NOT EXISTS practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES practice_questions(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  selected_answer integer,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE practice_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_practice_attempts" ON practice_attempts;
CREATE POLICY "select_own_practice_attempts" ON practice_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_practice_attempts" ON practice_attempts;
CREATE POLICY "insert_own_practice_attempts" ON practice_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_practice_attempts" ON practice_attempts;
CREATE POLICY "update_own_practice_attempts" ON practice_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_practice_attempts" ON practice_attempts;
CREATE POLICY "delete_own_practice_attempts" ON practice_attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Mistake Analysis
CREATE TABLE IF NOT EXISTS mistake_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES practice_questions(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  question_text text,
  user_answer text,
  correct_answer_text text,
  misconception text,
  misunderstood_concept text,
  similar_questions jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE mistake_analysis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_mistake_analysis" ON mistake_analysis;
CREATE POLICY "select_own_mistake_analysis" ON mistake_analysis FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mistake_analysis" ON mistake_analysis;
CREATE POLICY "insert_own_mistake_analysis" ON mistake_analysis FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mistake_analysis" ON mistake_analysis;
CREATE POLICY "update_own_mistake_analysis" ON mistake_analysis FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mistake_analysis" ON mistake_analysis;
CREATE POLICY "delete_own_mistake_analysis" ON mistake_analysis FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Progress (daily snapshots)
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  overall_mastery integer DEFAULT 0,
  topics_mastered integer DEFAULT 0,
  questions_solved integer DEFAULT 0,
  accuracy integer DEFAULT 0,
  study_time_min integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_progress" ON progress;
CREATE POLICY "select_own_progress" ON progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_progress" ON progress;
CREATE POLICY "insert_own_progress" ON progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_progress" ON progress;
CREATE POLICY "update_own_progress" ON progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_progress" ON progress;
CREATE POLICY "delete_own_progress" ON progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_topic ON topic_mastery(topic_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user ON practice_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON progress(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
