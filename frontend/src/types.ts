
export interface AlgebraProblem {
    topic: string;
    problem: string;
    difficulty: string;
}

export interface FillInTheBlankProblem {
    question: string; // e.g., "3x = 6. To solve for x, we divide by [?]"
    answer: string;   // e.g., "3"
}

export interface Message {
    id: string;
    role: 'user' | 'model' | 'problem' | 'visual_solution' | 'kinesthetic_question';
    text: string;
    problemData?: AlgebraProblem;
    solutionSteps?: string[];
    questionData?: FillInTheBlankProblem;
}

export interface TopicProgress {
    attempted: number;
    correct: number;
}

export interface ProgressData {
    startTime: number;
    topics: Record<string, TopicProgress>;
}

export type AttentionState = 'focused' | 'distracted' | 'away';