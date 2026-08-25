import { supabase } from './supabase';
import { DEMO_TOPICS, getMasteryStatus } from './demo-data';
import type { Subject, Topic, Question, DashboardStats, ProgressPoint, LearningPlanDay } from './types';
import { generateLearningPlan, recalculateMastery } from './ai-engine';

const DEMO_SUBJECT_NAME = 'Data Structures & Algorithms';

export async function getOrCreateDemoSubject(userId: string): Promise<Subject | null> {
  const { data: existing } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .eq('name', DEMO_SUBJECT_NAME)
    .maybeSingle();

  if (existing) return existing as Subject;

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      user_id: userId,
      name: DEMO_SUBJECT_NAME,
      exam_date: '2026-12-15',
      daily_study_time_min: 45,
      current_confidence: 50,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating demo subject:', error);
    return null;
  }

  await seedDemoTopics(userId, data.id);
  return data as Subject;
}

export async function seedDemoTopics(userId: string, subjectId: string): Promise<void> {
  // Check if topics already exist
  const { data: existing } = await supabase
    .from('topics')
    .select('id')
    .eq('subject_id', subjectId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const topicRows = DEMO_TOPICS.map((t, i) => ({
    user_id: userId,
    subject_id: subjectId,
    name: t.name,
    category: t.category,
    mastery_score: t.masteryScore,
    status: getMasteryStatus(t.masteryScore),
    weak_concepts: t.weakConcepts,
    recommended_lessons: t.recommendedLessons,
    sort_order: i,
  }));

  const { data: insertedTopics, error } = await supabase
    .from('topics')
    .insert(topicRows)
    .select();

  if (error || !insertedTopics) {
    console.error('Error seeding topics:', error);
    return;
  }

  // Seed topic mastery
  const masteryRows = insertedTopics.map((t) => ({
    user_id: userId,
    topic_id: t.id,
    subject_id: subjectId,
    mastery_score: t.mastery_score,
    status: t.mastery_status || getMasteryStatus(t.mastery_score),
    questions_attempted: 0,
    questions_correct: 0,
  }));

  await supabase.from('topic_mastery').insert(masteryRows);

  // Seed diagnostic questions
  const diagQuestionRows: any[] = [];
  for (const topic of insertedTopics) {
    const topicData = DEMO_TOPICS.find((t) => t.name === topic.name);
    if (topicData) {
      for (const q of topicData.diagnosticQuestions) {
        diagQuestionRows.push({
          topic_id: topic.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
        });
      }
    }
  }
  await supabase.from('diagnostic_questions').insert(diagQuestionRows);

  // Seed practice questions
  const practiceQuestionRows: any[] = [];
  for (const topic of insertedTopics) {
    const topicData = DEMO_TOPICS.find((t) => t.name === topic.name);
    if (topicData) {
      for (const q of topicData.practiceQuestions) {
        practiceQuestionRows.push({
          topic_id: topic.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          concept: q.concept,
          related_topic: q.related_topic,
          difficulty: q.difficulty,
        });
      }
    }
  }
  await supabase.from('practice_questions').insert(practiceQuestionRows);

  // Seed initial progress data (14 days of history)
  const progressRows: any[] = [];
  const baseMastery = 45;
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const mastery = Math.min(72, baseMastery + Math.round((13 - i) * 2 + Math.random() * 3));
    progressRows.push({
      user_id: userId,
      subject_id: subjectId,
      snapshot_date: date.toISOString().split('T')[0],
      overall_mastery: mastery,
      topics_mastered: Math.floor(mastery / 10),
      questions_solved: Math.max(0, 142 - i * 10 + Math.floor(Math.random() * 5)),
      accuracy: Math.min(85, 60 + Math.round((13 - i) * 1.5 + Math.random() * 5)),
      study_time_min: Math.max(20, 45 - i * 2 + Math.floor(Math.random() * 15)),
    });
  }
  await supabase.from('progress').insert(progressRows);

  // Seed some study sessions for streak
  const sessionRows: any[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const topicIdx = Math.floor(Math.random() * insertedTopics.length);
    sessionRows.push({
      user_id: userId,
      subject_id: subjectId,
      topic_id: insertedTopics[topicIdx].id,
      duration_min: 30 + Math.floor(Math.random() * 30),
      session_type: i % 3 === 0 ? 'practice' : 'study',
      created_at: date.toISOString(),
    });
  }
  await supabase.from('study_sessions').insert(sessionRows);
}

export async function getSubjects(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Subject[];
}

export async function getTopics(subjectId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data as Topic[];
}

export async function getDiagnosticQuestions(topicIds: string[]): Promise<Question[]> {
  if (topicIds.length === 0) return [];
  const { data, error } = await supabase
    .from('diagnostic_questions')
    .select('*')
    .in('topic_id', topicIds);
  if (error) return [];
  return data as Question[];
}

export async function getPracticeQuestions(topicId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('topic_id', topicId);
  if (error) return [];
  return data as Question[];
}

export async function getDashboardStats(userId: string, subjectId: string): Promise<DashboardStats> {
  const { data: topics } = await supabase
    .from('topics')
    .select('mastery_score')
    .eq('subject_id', subjectId);

  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('created_at')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false });

  const { data: attempts } = await supabase
    .from('practice_attempts')
    .select('id')
    .eq('user_id', userId)
    .eq('subject_id', subjectId);

  const topicList = topics || [];
  const overallMastery = topicList.length > 0
    ? Math.round(topicList.reduce((sum: number, t: any) => sum + t.mastery_score, 0) / topicList.length)
    : 0;
  const topicsMastered = topicList.filter((t: any) => t.mastery_score >= 80).length;
  const knowledgeGaps = topicList.filter((t: any) => t.mastery_score < 60).length;

  // Calculate streak
  let streak = 0;
  if (sessions && sessions.length > 0) {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasSession = sessions.some((s: any) => s.created_at.startsWith(dateStr));
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
  }

  return {
    overall_mastery: progress?.overall_mastery || overallMastery,
    topics_mastered: topicsMastered,
    total_topics: topicList.length,
    study_streak: streak,
    questions_solved: attempts?.length || 142,
    knowledge_gaps: knowledgeGaps,
    today_goal_min: 45,
    today_completed_min: 20,
  };
}

export async function getProgressData(userId: string, subjectId: string): Promise<ProgressPoint[]> {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .order('snapshot_date', { ascending: true });
  if (error || !data) return [];
  return data.map((p: any) => ({
    date: p.snapshot_date,
    mastery: p.overall_mastery,
    questions: p.questions_solved,
    accuracy: p.accuracy,
    study_time: p.study_time_min,
  }));
}

export async function saveDiagnosticAttempt(
  userId: string,
  subjectId: string,
  answers: Record<string, number>,
  overallScore: number
): Promise<void> {
  await supabase.from('diagnostic_attempts').insert({
    user_id: userId,
    subject_id: subjectId,
    answers: answers,
    overall_score: overallScore,
  });
}

export async function updateTopicMastery(
  userId: string,
  topicId: string,
  subjectId: string,
  newScore: number
): Promise<void> {
  const status = getMasteryStatus(newScore);
  await supabase
    .from('topics')
    .update({ mastery_score: newScore, status })
    .eq('id', topicId);

  await supabase
    .from('topic_mastery')
    .update({
      mastery_score: newScore,
      status,
      last_assessed: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('topic_id', topicId);
}

export async function recordPracticeAttempt(
  userId: string,
  question: Question,
  subjectId: string,
  selectedAnswer: number,
  isCorrect: boolean
): Promise<void> {
  await supabase.from('practice_attempts').insert({
    user_id: userId,
    question_id: question.id,
    topic_id: question.topic_id,
    subject_id: subjectId,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
  });

  // Update topic mastery
  const { data: mastery } = await supabase
    .from('topic_mastery')
    .select('*')
    .eq('topic_id', question.topic_id)
    .maybeSingle();

  if (mastery) {
    const newAttempted = mastery.questions_attempted + 1;
    const newCorrect = mastery.questions_correct + (isCorrect ? 1 : 0);
    const newScore = recalculateMastery(
      mastery.mastery_score,
      isCorrect,
      newAttempted,
      newCorrect
    );

    await supabase
      .from('topic_mastery')
      .update({
        questions_attempted: newAttempted,
        questions_correct: newCorrect,
        mastery_score: newScore,
        status: getMasteryStatus(newScore),
        updated_at: new Date().toISOString(),
      })
      .eq('topic_id', question.topic_id);

    await supabase
      .from('topics')
      .update({ mastery_score: newScore, status: getMasteryStatus(newScore) })
      .eq('id', question.topic_id);
  }
}

export async function saveMistakeAnalysis(
  userId: string,
  question: Question,
  subjectId: string,
  analysis: any
): Promise<void> {
  await supabase.from('mistake_analysis').insert({
    user_id: userId,
    question_id: question.id,
    topic_id: question.topic_id,
    subject_id: subjectId,
    question_text: analysis.question_text,
    user_answer: analysis.user_answer,
    correct_answer_text: analysis.correct_answer_text,
    misconception: analysis.misconception,
    misunderstood_concept: analysis.misunderstood_concept,
    similar_questions: analysis.similar_questions,
  });
}

export async function getOrCreateLearningPlan(
  userId: string,
  subjectId: string,
  topics: Topic[],
  dailyStudyTime: number
): Promise<LearningPlanDay[]> {
  const { data: existing } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && existing.plan_data) {
    return existing.plan_data as LearningPlanDay[];
  }

  const plan = generateLearningPlan(topics, dailyStudyTime);
  await supabase.from('learning_plans').insert({
    user_id: userId,
    subject_id: subjectId,
    plan_data: plan,
    version: 1,
  });

  return plan;
}

export async function updateLearningPlan(
  userId: string,
  subjectId: string,
  topics: Topic[],
  dailyStudyTime: number
): Promise<LearningPlanDay[]> {
  const newPlan = generateLearningPlan(topics, dailyStudyTime);

  const { data: existing } = await supabase
    .from('learning_plans')
    .select('version')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newVersion = (existing?.version || 1) + 1;

  await supabase.from('learning_plans').insert({
    user_id: userId,
    subject_id: subjectId,
    plan_data: newPlan,
    version: newVersion,
  });

  return newPlan;
}

export async function markPlanDayComplete(
  userId: string,
  subjectId: string,
  dayNumber: number
): Promise<void> {
  const { data: plan } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (plan && plan.plan_data) {
    const planData = plan.plan_data as LearningPlanDay[];
    const updated = planData.map((d) =>
      d.day === dayNumber ? { ...d, completed: true } : d
    );

    await supabase
      .from('learning_plans')
      .update({ plan_data: updated, updated_at: new Date().toISOString() })
      .eq('id', plan.id);
  }
}
