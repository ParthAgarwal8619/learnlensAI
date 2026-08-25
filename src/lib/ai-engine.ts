import type { Question, Topic, MistakeAnalysis, LearningPlanDay, LearningPlan } from './types';
import { DEMO_TOPICS, getMasteryStatus } from './demo-data';

// Deterministic demo AI engine - produces realistic responses without any external API

export function analyzeSyllabus(text: string): { topicCount: number; topics: string[]; estimatedDuration: string } {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const detectedTopics: string[] = [];

  for (const topic of DEMO_TOPICS) {
    const keywords = topic.name.toLowerCase().split(' ');
    const topicWords = topic.name.toLowerCase();
    if (text.toLowerCase().includes(topicWords) || keywords.some((kw) => text.toLowerCase().includes(kw))) {
      detectedTopics.push(topic.name);
    }
  }

  if (detectedTopics.length < 3) {
    return {
      topicCount: DEMO_TOPICS.length,
      topics: DEMO_TOPICS.map((t) => t.name),
      estimatedDuration: '6-8 weeks',
    };
  }

  return {
    topicCount: detectedTopics.length,
    topics: detectedTopics,
    estimatedDuration: `${Math.ceil(detectedTopics.length * 0.8)} weeks`,
  };
}

export function generateTutorResponse(query: string, quickAction?: string): string {
  const q = query.toLowerCase();

  if (quickAction === 'quiz_me') {
    return "Let's test your understanding! Here's a quick question:\n\n**In a binary search tree, what is the relationship between a parent node and its children?**\n\nA) Both children are larger than the parent\nB) Left child is smaller, right child is larger\nC) Both children are smaller than the parent\nD) There is no specific relationship\n\nTake a moment to think about it, then share your answer!";
  }

  if (quickAction === 'summarize') {
    return "Here's a quick summary of what we've covered:\n\n• **Arrays** provide O(1) access by index but O(n) insertion/deletion\n• **Linked Lists** offer O(1) insertion/deletion at known positions but O(n) access\n• **Trees** organize data hierarchically — BSTs enable O(log n) search when balanced\n• **Graphs** model relationships between entities using vertices and edges\n• **Hash Tables** provide O(1) average-case lookups using hash functions\n\nFocus on understanding *when* to use each structure based on the operations your problem requires.";
  }

  if (q.includes('binary tree') || q.includes('trees') || q.includes('tree')) {
    if (quickAction === 'give example') {
      return "Here's an example of a binary tree:\n\n```\n        10\n       /  \\\n      5    15\n     / \\     \\\n    3   7    20\n```\n\nThis is a **Binary Search Tree** because every left child is smaller than its parent, and every right child is larger. This property makes search operations O(log n) — at each step, you eliminate half the tree.";
    }
    if (quickAction === 'show analogy') {
      return "Think of a binary tree like a **decision tree in real life**:\n\nImagine you're at a restaurant. The waiter asks: \"Soup or salad?\" That's the root. You pick salad, then they ask \"Caesar or garden?\" — you've gone one level deeper. Each question splits your options into two branches, just like a binary tree where each node has at most two children.\n\nA **Binary Search Tree** is like a phone book: you open to the middle, compare the name, and go left (earlier) or right (later) — cutting the search space in half each time.";
    }
    return "A **binary tree** is a hierarchical data structure where each node has at most two children, referred to as the left child and right child.\n\n**Key concepts to understand:**\n\n1. **Root**: The topmost node with no parent\n2. **Leaf**: A node with no children\n3. **Height**: The longest path from root to a leaf\n4. **Depth**: The distance from the root to a node\n\n**Binary Search Tree (BST)** adds a rule: left child < parent < right child. This property enables efficient O(log n) search, insert, and delete operations.\n\n**Common traversals:**\n- *Inorder* (Left→Root→Right): visits BST nodes in sorted order\n- *Preorder* (Root→Left→Right): useful for copying trees\n- *Postorder* (Left→Right→Root): useful for deleting trees\n\nSince your current mastery on Trees is 34%, I'd recommend starting with the fundamentals: understand how nodes connect, then practice traversals on paper before coding.";
  }

  if (q.includes('graph') || q.includes('bfs') || q.includes('dfs')) {
    if (quickAction === 'give example') {
      return "Here's an example of a graph and its BFS traversal:\n\n```\n    A --- B\n    |     | \\\n    C --- D   E\n```\n\n**BFS from A**: A → B → C → D → E (level by level)\n**DFS from A**: A → B → D → C → E (or A → B → E → D → C, depending on order)\n\nBFS uses a **queue**, DFS uses a **stack** (or recursion).";
    }
    if (quickAction === 'show analogy') {
      return "Think of a graph like a **social network**:\n\n- Each person is a **vertex** (node)\n- Each friendship is an **edge** (connection)\n\n**BFS** is like asking friends, then friends-of-friends, then their friends — expanding outward level by level. Great for finding the *shortest* connection chain.\n\n**DFS** is like following one chain of introductions as deep as possible before backtracking. Great for exploring if a path exists at all.";
    }
    return "A **graph** is a data structure consisting of vertices (nodes) connected by edges. Graphs model relationships — social networks, maps, dependency chains.\n\n**Two main representations:**\n1. **Adjacency Matrix**: O(V²) space — fast edge lookup, wasteful for sparse graphs\n2. **Adjacency List**: O(V + E) space — efficient for sparse graphs, most common\n\n**Two main traversals:**\n- **BFS** (Breadth-First): Uses a queue, explores level-by-level. Finds shortest path in unweighted graphs.\n- **DFS** (Depth-First): Uses a stack/recursion, goes deep before backtracking. Used for cycle detection, topological sort.\n\nSince your mastery on Graphs is 27% (critical), I recommend starting with graph representation, then practicing BFS and DFS on small examples before tackling shortest-path algorithms.";
  }

  if (q.includes('hash') || q.includes('hashing')) {
    return "A **hash table** stores key-value pairs using a hash function to map keys to array indices.\n\n**How it works:**\n1. A hash function converts a key into an integer (the index)\n2. The value is stored at that index\n3. Lookup: hash the key again → go directly to that index\n\n**Average case**: O(1) for insert, lookup, delete\n**Worst case**: O(n) when many collisions occur\n\n**Collision resolution:**\n- *Chaining*: Store colliding items in a linked list at each bucket\n- *Open addressing*: Find the next available slot (linear probing, double hashing)\n\n**Load factor** (n/buckets) should stay below ~0.75 to maintain performance. When exceeded, the table is resized and rehashed.";
  }

  if (q.includes('array')) {
    return "An **array** is a contiguous block of memory storing elements of the same type, accessed by index.\n\n**Strengths:**\n- O(1) random access by index\n- Cache-friendly due to memory contiguity\n- Simple to implement\n\n**Weaknesses:**\n- O(n) insertion/deletion in the middle (requires shifting)\n- Fixed size (unless using dynamic arrays)\n\n**Key techniques:**\n- **Two-pointer**: Use two indices moving toward each other (e.g., reverse, two-sum in sorted array)\n- **Sliding window**: Maintain a window of elements, useful for subarray problems\n- **Prefix sums**: Precompute cumulative sums for range queries in O(1)";
  }

  if (q.includes('linked list') || q.includes('linkedlist')) {
    return "A **linked list** is a linear data structure where elements (nodes) are connected via pointers.\n\n**Each node contains:** data + a pointer to the next node\n\n**Types:**\n- *Singly linked*: Each node points to the next; last node points to null\n- *Doubly linked*: Each node has pointers to both next and previous\n- *Circular*: Last node points back to the first\n\n**Strengths over arrays:**\n- O(1) insertion/deletion at a known position\n- Dynamic size (no resizing needed)\n\n**Weaknesses:**\n- O(n) random access (must traverse from head)\n- Extra memory for pointers\n\n**Key algorithms:** Reversing a list, cycle detection (Floyd's), finding the middle node, merging sorted lists.";
  }

  if (q.includes('stack') || q.includes('queue')) {
    return "**Stacks** and **Queues** are linear structures with restricted access patterns.\n\n**Stack** (LIFO — Last In, First Out):\n- Operations: push (add to top), pop (remove from top), peek (view top)\n- Use cases: undo/redo, function call stack, balanced parentheses, expression evaluation\n\n**Queue** (FIFO — First In, First Out):\n- Operations: enqueue (add to rear), dequeue (remove from front)\n- Use cases: BFS, scheduling, buffering, level-order traversal\n\nBoth can be implemented using arrays or linked lists. A **deque** (double-ended queue) allows operations at both ends.";
  }

  if (q.includes('sort') || q.includes('sorting')) {
    return "**Sorting algorithms** arrange elements in a specific order.\n\n**Comparison-based (O(n log n) optimal):**\n- *Merge sort*: Divide and conquer, stable, O(n log n) always, O(n) space\n- *Quick sort*: Partition around a pivot, O(n log n) average, O(n²) worst, in-place\n- *Heap sort*: Build a heap, extract max/min repeatedly, O(n log n), in-place\n\n**Simple (O(n²)):**\n- *Bubble, Selection, Insertion* — easy to understand, inefficient for large data\n\n**Non-comparison (O(n) with constraints):**\n- *Counting sort, Radix sort* — use when keys have a limited range\n\n**Stability**: A sort is stable if equal elements maintain their relative order. Merge sort is stable; quick sort typically is not.";
  }

  if (q.includes('search') || q.includes('binary search')) {
    return "**Searching** finds an element in a collection.\n\n**Linear Search**: O(n) — check each element. Works on any list.\n\n**Binary Search**: O(log n) — requires a **sorted** array. Compare the middle element; if target is smaller, search the left half; if larger, search the right half. Repeat until found or the range is empty.\n\n**Key insight**: Binary search halves the search space each step, making it extremely efficient for large sorted datasets.\n\n**Common pitfalls**: Off-by-one errors in boundary conditions. Always be clear about whether your search range is [low, high] or [low, high).";
  }

  return "I'm your AI tutor! I can explain data structures and algorithms concepts at your level. Try asking me about:\n\n• **Binary trees** — structure, traversals, BST properties\n• **Graphs** — BFS, DFS, shortest paths\n• **Arrays** — two-pointer, sliding window\n• **Linked lists** — reversal, cycle detection\n• **Hashing** — hash tables, collision resolution\n• **Sorting** — merge sort, quick sort, complexity\n• **Searching** — binary search, linear search\n\nOr use the quick action buttons below for specific help!";
}

export function explainMistake(
  question: Question,
  selectedAnswer: number,
  topicName: string
): MistakeAnalysis {
  const userAnswer = question.options[selectedAnswer];
  const correctAnswer = question.options[question.correct_answer];

  // Generate misconception explanation based on the question
  const misconceptions: Record<string, string> = {
    'BFS': `You confused the order in which nodes are explored. **BFS** explores level-by-level using a **queue** (FIFO), visiting all neighbors before going deeper. **DFS** explores depth-first using a **stack** (LIFO), going as deep as possible before backtracking. The key difference is the data structure: queue vs stack.`,
    'DFS': `You mixed up the traversal strategy. **DFS** goes as deep as possible along each branch before backtracking, using a **stack**. **BFS** explores level-by-level using a **queue**. Remember: DFS = Stack, BFS = Queue.`,
    'Binary search': `You may have confused the search condition. Binary search works by comparing the **middle** element and eliminating half the search space. If the target is smaller, search the **left** half; if larger, search the **right** half. The array must be **sorted** for this to work.`,
    'Cycle detection': `You confused the cycle detection approach. Floyd's algorithm uses **two pointers** moving at different speeds (slow: 1 step, fast: 2 steps). If they meet, a cycle exists. If the fast pointer reaches null, there's no cycle.`,
    'AVL trees': `You confused the balancing condition. An AVL tree requires the **balance factor** (left height - right height) of every node to be in [-1, 0, 1]. When insertion or deletion violates this, **rotations** restore balance.`,
    'Dijkstra': `Dijkstra's algorithm cannot handle **negative weight edges** because it permanently labels nodes once visited. A negative edge could provide a shorter path to an already-processed node, but Dijkstra won't reconsider it. Use Bellman-Ford for graphs with negative edges.`,
    'Hash table': `You may have confused the collision resolution strategy. **Chaining** uses linked lists at each bucket. **Open addressing** (linear probing, double hashing) finds alternative slots within the array itself.`,
    'Load factor': `You confused what happens at high load factors. When the load factor exceeds a threshold (~0.75), the table must be **resized** (usually doubled) and all elements **rehashed** to new positions. This maintains O(1) average performance.`,
    'Circular queue': `You may have miscounted elements in a circular queue. The formula is: (rear - front + size) % size + 1, because the queue wraps around. A simple rear - front doesn't account for the circular nature.`,
    'Heap': `You confused the heap property. In a **max-heap**, every parent is **greater than or equal to** its children, so the root is the maximum. In a **min-heap**, every parent is smaller, so the root is the minimum.`,
    'Two-pointer': `You may have confused the two-pointer technique. In a sorted array, place one pointer at the **start** and one at the **end**. If the sum equals the target, done. If too small, move the left pointer right. If too large, move the right pointer left.`,
  };

  let misconception = `You selected "${userAnswer}" but the correct answer is "${correctAnswer}". `;

  // Find matching misconception
  for (const [key, explanation] of Object.entries(misconceptions)) {
    if (question.concept.includes(key) || question.question.includes(key) || topicName.includes(key)) {
      misconception = explanation;
      break;
    }
  }

  if (misconception === `You selected "${userAnswer}" but the correct answer is "${correctAnswer}". `) {
    misconception += question.explanation;
  }

  // Generate 3 similar questions
  const similarQuestions = generateSimilarQuestions(question, topicName);

  return {
    question_text: question.question,
    user_answer: userAnswer,
    correct_answer_text: correctAnswer,
    misconception,
    misunderstood_concept: question.concept,
    similar_questions: similarQuestions,
  };
}

function generateSimilarQuestions(original: Question, topicName: string): Question[] {
  const topicData = DEMO_TOPICS.find((t) => t.name === topicName);
  if (!topicData) return [];

  // Get practice questions from the same topic, excluding the original
  const pool = topicData.practiceQuestions.filter(
    (pq) => pq.question !== original.question
  );

  const result: Question[] = [];
  for (const pq of pool) {
    result.push({
      ...pq,
      id: `sim_${Math.random().toString(36).slice(2)}`,
      topic_id: original.topic_id,
    });
  }

  // If we need more, create variations
  while (result.length < 3) {
    const base = pool[result.length % Math.max(pool.length, 1)] || topicData.diagnosticQuestions[0];
    if (base) {
      result.push({
        ...base,
        id: `sim_${Math.random().toString(36).slice(2)}`,
        topic_id: original.topic_id,
        question: base.question + ' (variation)',
      });
    } else {
      break;
    }
  }

  return result.slice(0, 3);
}

export function generateLearningPlan(
  topics: Topic[],
  dailyStudyTime: number
): LearningPlanDay[] {
  // Sort topics by mastery score ascending (weakest first)
  const sortedTopics = [...topics].sort((a, b) => a.mastery_score - b.mastery_score);

  // Prioritize critical and weak topics
  const weakTopics = sortedTopics.filter((t) => t.mastery_score < 60);
  const otherTopics = sortedTopics.filter((t) => t.mastery_score >= 60);

  const plan: LearningPlanDay[] = [];
  const topicQueue = [...weakTopics, ...otherTopics];

  const dayTemplates = [
    { type: 'study' as const, title: 'Fundamentals', duration: 25 },
    { type: 'study' as const, title: 'Deep Dive', duration: 30 },
    { type: 'study' as const, title: 'Advanced Concepts', duration: 30 },
    { type: 'practice' as const, title: 'Practice', duration: 35 },
    { type: 'practice' as const, title: 'Targeted Practice', duration: 40 },
    { type: 'test' as const, title: 'Mock Test', duration: 45 },
    { type: 'reassessment' as const, title: 'Reassessment', duration: 30 },
  ];

  for (let i = 0; i < 7; i++) {
    const topic = topicQueue[i % topicQueue.length] || sortedTopics[0];
    const template = dayTemplates[i];
    const topicData = DEMO_TOPICS.find((t) => t.name === topic?.name);
    const lesson = topicData?.recommendedLessons[0] || template.title;

    plan.push({
      day: i + 1,
      title: `${topic?.name || 'Review'}: ${lesson}`,
      topic: topic?.name || 'Review',
      topic_id: topic?.id || '',
      duration_min: Math.max(template.duration, dailyStudyTime),
      type: template.type,
      completed: false,
      description: getDescriptionForType(template.type, topic?.name || 'this topic'),
    });
  }

  return plan;
}

function getDescriptionForType(type: string, topicName: string): string {
  switch (type) {
    case 'study':
      return `Learn the core concepts of ${topicName}. Read materials, watch videos, and take notes on key definitions and properties.`;
    case 'practice':
      return `Solve practice problems on ${topicName}. Focus on applying what you've learned to build muscle memory.`;
    case 'test':
      return `Take a timed mock test covering ${topicName} and related topics. Simulate exam conditions.`;
    case 'reassessment':
      return `Retake the diagnostic assessment for ${topicName} to measure your improvement and update your mastery score.`;
    default:
      return `Study session for ${topicName}.`;
  }
}

export function recalculateMastery(
  currentScore: number,
  isCorrect: boolean,
  totalAttempts: number,
  correctAttempts: number
): number {
  // Blend current score with recent performance
  const recentAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
  const weight = Math.min(totalAttempts / 10, 0.5); // Weight recent performance up to 50%
  const newScore = Math.round(currentScore * (1 - weight) + recentAccuracy * weight);

  // If correct, nudge up; if wrong, nudge down
  const adjustment = isCorrect ? 3 : -2;
  return Math.max(0, Math.min(100, newScore + adjustment));
}

export function getAdaptivePlanUpdate(
  oldScore: number,
  newScore: number,
  topicName: string
): string {
  if (newScore > oldScore && newScore >= 60) {
    return `Great progress! ${topicName} improved from ${oldScore}% to ${newScore}%. We're reducing its priority in your plan and shifting focus to weaker areas.`;
  }
  if (newScore <= oldScore) {
    return `${topicName} hasn't improved (still at ${newScore}%). We're increasing ${topicName} practice in your plan to help you master it.`;
  }
  return `${topicName} improved from ${oldScore}% to ${newScore}%. Your plan has been updated to reflect your current performance.`;
}
