export interface ExamConfig {
  examName: string;
  examDate: string; // YYYY-MM-DD
  dailyGoal: number;
  weeklyGoal: number;
}

export interface PYQSubjectData {
  target: number;
  completed: number;
  correct: number;
  wrong: number;
  studyMinutes: number; // minutes spent
}

export interface PYQDayData {
  date: string; // YYYY-MM-DD
  physics: PYQSubjectData;
  chemistry: PYQSubjectData;
  maths: PYQSubjectData;
}

export type Subject = "physics" | "chemistry" | "maths";
export type ChapterStatus = "completed" | "pending";
export type ChapterTag = "weak" | "strong" | "neutral";
export type MistakeType = "concept" | "silly" | "formula";

export interface Chapter {
  id: string;
  subject: Subject;
  name: string;
  pyqsDone: number;
  status: ChapterStatus;
  tag: ChapterTag;
  mistakeCount: number;
}

export interface Mistake {
  id: string;
  subject: Subject;
  chapterName: string;
  mistakeType: MistakeType;
  description: string;
  date: string; // YYYY-MM-DD
  repeatCount: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  notes: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  totalPYQs: number;
  goalMet: boolean;
  studySeconds: number;
}
