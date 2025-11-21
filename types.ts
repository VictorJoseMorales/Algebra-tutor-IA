export interface Transcription {
    user: string;
    model: string;
}

export interface AlgebraProblem {
    topic: string;
    problem: string;
    difficulty: string;
}

export interface Message {
    id: string;
    role: 'user' | 'model' | 'problem';
    text: string;
    problemData?: AlgebraProblem;
}

export interface ProgressData {
    topics: Set<string>;
    attempted: number;
    correct: number;
    startTime: number;
}

export type AttentionState = 'focused' | 'distracted' | 'away';

export interface TrackProgressArgs {
    topic: string;
    correctlySolved: boolean;
}
