# LearnLens AI

> **Find what you don't know. Learn what matters.**

LearnLens AI is an AI-powered personalized learning and knowledge-gap coach built for the **Horizon — Round 1: Online MVP Challenge** under the theme **AI with Education**.

The core idea is simple: students should not have to study every topic equally. LearnLens AI analyzes learning content, diagnoses understanding, identifies knowledge gaps, and continuously adapts a student's learning plan.

---

## 🚀 Live Demo

**Live MVP:** https://learnlens-ai-hjl7.bolt.host

---

## 🎯 Problem

Students have access to huge amounts of educational content, but they often do not know:

- Which concepts they actually understand
- Which concepts they are weak in
- Why they are repeatedly making the same mistakes
- What they should study next
- How much time they should spend on each topic

Traditional study plans treat the syllabus almost uniformly. Generic AI tutors can answer questions, but answering a question is not the same as understanding a student's learning gaps.

This leads to:

**Full Syllabus → Hidden Knowledge Gaps → Inefficient Study → Late Discovery of Weak Topics**

---

## 💡 Solution

LearnLens AI creates a personalized learning loop around the student's actual understanding.

### Core workflow

```text
Syllabus / PDF
      ↓
AI Topic Analysis
      ↓
Diagnostic Assessment
      ↓
Knowledge Gap Detection
      ↓
Personalized Learning Plan
      ↓
AI Tutor
      ↓
Practice
      ↓
Mistake Analysis
      ↓
Reassessment
      ↓
Adaptive Learning
```

Instead of only asking:

> "What is the answer?"

LearnLens AI focuses on:

> "What does this student need to understand next?"

---

## ⭐ Key Innovation — Explain My Mistake

The signature feature of LearnLens AI is **Explain My Mistake**.

When a student answers a question incorrectly, the platform does more than show the correct answer.

It attempts to turn the mistake into a learning signal:

```text
Wrong Answer
     ↓
Identify Misconception
     ↓
Explain Why It Happened
     ↓
Generate Targeted Questions
     ↓
Practice
     ↓
Reassess
```

### Example

**Question:**  
Which traversal explores nodes level-by-level?

**Student Answer:** DFS ❌

**Correct Answer:** BFS ✅

Instead of simply saying "Wrong", LearnLens AI explains the conceptual confusion between depth-first and level-by-level exploration and generates targeted practice.

This makes mistakes useful rather than discouraging.

---

## 🧠 Knowledge Map

LearnLens AI represents learning progress at the topic level.

Example prototype view:

| Topic | Mastery | Priority |
|---|---:|---|
| Arrays | 91% | Low |
| Linked Lists | 78% | Medium |
| Stacks | 84% | Low |
| Queues | 81% | Low |
| Trees | 34% | Critical |
| Graphs | 27% | Critical |
| Sorting | 82% | Low |
| Hashing | 52% | High |

> **Note:** These values are prototype/demo data and are not claimed as measured research results.

The goal is to help a student answer:

**"Where should I spend my next 30 minutes?"**

---

## 🔄 Adaptive Learning

The learning plan changes based on student performance.

For example:

```text
Day 1 → Trees Fundamentals
Day 2 → Binary Search Trees
Day 3 → Graph Representation
Day 4 → BFS + DFS
Day 5 → Targeted Practice
Day 6 → Mock Test
Day 7 → Reassessment
```

If the student improves in a topic, that topic can receive lower priority.

If a weakness remains, the system can prioritize additional explanation and targeted practice.

> Any mastery improvements shown in the prototype are illustrative scenarios, not measured outcomes.

---

## 🖥️ MVP Features

The current MVP is designed around the complete learning journey:

- Personalized learning dashboard
- Syllabus/topic-based learning flow
- Topic-level knowledge map
- Diagnostic assessment experience
- Weak-topic identification
- Personalized study plan
- AI tutor experience
- Explain My Mistake workflow
- Targeted practice
- Progress tracking
- Adaptive learning concept
- Modern student-focused UI

---

## 🏗️ Technical Architecture

```text
                 ┌─────────────────────┐
                 │       STUDENT       │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │   React Web App     │
                 │ TypeScript + Vite   │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ Syllabus / Topics   │
                 │    Extraction       │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ Diagnostic Engine   │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ Knowledge Gap +     │
                 │ Mastery Scoring     │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ AI Tutor + Mistake  │
                 │      Analysis       │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ Adaptive Learning   │
                 │      Planner        │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │ Progress / Database │
                 └─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Data / Backend

- Supabase / PostgreSQL architecture
- API-based service design

### AI

- AI-powered topic analysis
- AI tutoring
- Misconception explanation
- Targeted question generation
- Adaptive learning recommendations

### Visualization

- Recharts
- Progress indicators
- Topic mastery visualizations

---

## 👨‍💻 Team

### Team debugging

**Parth Agrawal**  
Team Leader

**Akash Gaurav**  
Team Member

**Prince Soni**  
Team Member

The project is designed as an MVP with a focused product scope so that the core learning loop can be demonstrated end-to-end.

---

## 🎓 Hackathon Alignment

**Hackathon:** Horizon — Round 1: Online MVP Challenge

**Theme:** AI with Education

### Focus areas addressed

- Education
- Productivity
- Accessibility
- Student Life

### Why it fits the theme

LearnLens AI applies AI to a direct education problem: identifying what a learner does not understand and helping them improve through personalized, adaptive practice.

---

## 🌍 Potential Impact

LearnLens AI can help students:

- Spend less time revising concepts they already know
- Identify weak concepts earlier
- Understand the reason behind mistakes
- Get targeted practice
- Build a more personalized study routine
- Prepare more systematically for assessments

The platform can eventually support students, teachers, institutions, and learning platforms.

---

## 🗺️ Future Roadmap

### Phase 1 — MVP
Personalized learning loop and knowledge-gap detection.

### Phase 2 — Teacher Dashboard
Teachers can view topic-level class progress and common misconceptions.

### Phase 3 — Class Analytics
Identify class-wide learning gaps and recommend interventions.

### Phase 4 — Regional Language AI
Support personalized tutoring in Indian regional languages.

### Phase 5 — Voice Learning
Voice-based tutoring and conversational practice.

### Phase 6 — LMS Integration
Integrate with school and college learning management systems.

---

## 🔐 Responsible AI & Accuracy

LearnLens AI is designed as an educational assistance tool.

Important principles:

- AI-generated explanations should be treated as learning assistance.
- Educational content should be verified when accuracy is important.
- Prototype/demo numbers are clearly labeled as illustrative.
- The system should not claim measured learning improvement without real user testing.
- Student data should be handled with appropriate privacy and security controls.

---

## 📈 Business Potential

LearnLens AI can evolve into a SaaS platform.

### Potential users

- Individual students
- Coaching institutes
- Schools
- Colleges
- Online learning platforms

### Possible model

**Freemium**

Free:
- Basic assessments
- Limited knowledge maps
- Basic practice

Premium:
- Unlimited adaptive plans
- Advanced AI tutoring
- Detailed analytics
- Personalized revision
- Teacher/class dashboards

Institutional:
- School/college dashboards
- Class analytics
- LMS integrations

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/learnlens-ai.git
cd learnlens-ai
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 📁 Suggested Project Structure

```text
learnlens-ai/
├── src/
│   ├── components/
│   ├── pages/
│   ├── data/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   └── App.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🧪 MVP Demo Flow

For a hackathon demo, the recommended flow is:

```text
1. Open LearnLens AI
        ↓
2. Select a subject / syllabus
        ↓
3. Start diagnostic assessment
        ↓
4. Show knowledge map
        ↓
5. Open a weak topic
        ↓
6. Answer a question incorrectly
        ↓
7. Demonstrate "Explain My Mistake"
        ↓
8. Show targeted practice
        ↓
9. Show adaptive study plan
        ↓
10. Show progress / reassessment
```

This demonstrates the product's core story in a short amount of time.

---

## 🏆 Product Story

LearnLens AI is built around one simple principle:

> **Don't make students study everything equally. Help them learn what they need most.**

The product turns:

**Content → Assessment → Knowledge Gaps → Explanation → Practice → Adaptation**

into one continuous learning loop.

---

## 📄 Hackathon Submission

The project can be submitted with:

- Working MVP
- 2–3 minute demo video
- GitHub repository
- Live demo
- Project presentation

---

## 📌 Project Status

**Status:** MVP / Hackathon Prototype

**Live Demo:** https://learnlens-ai-hjl7.bolt.host

---

## 📜 License

This project is currently developed as a hackathon MVP.

A production release should define an appropriate open-source or proprietary license based on the team's intended distribution model.
