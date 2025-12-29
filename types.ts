
export enum ToolMode {
  QUESTION_GENERATOR = 'Question Generator',
  MEMORANDUM = 'Memorandum / Model Answers',
  WORKSHEET_BUILDER = 'Worksheet & Revision Builder',
  REWRITER = 'Question Rewriter'
}

export enum CognitiveLevel {
  LOWER = 'Lower Order (Recall, State)',
  MIDDLE = 'Middle Order (Explain, Compare)',
  HIGHER = 'Higher Order (Analyse, Evaluate)',
  MIXED = 'Mixed (Standard NSC Paper)'
}

export interface GeneratorParams {
  subject: string;
  grade: string;
  topic: string;
  subTopic: string;
  mode: ToolMode;
  cognitiveLevel: CognitiveLevel;
  questionCount: number;
  totalMarks: number;
  additionalNotes?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  timestamp: string;
}
