import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExamConfig {
    weeklyGoal: bigint;
    examDate: Time;
    examName: string;
    dailyPYQGoal: bigint;
}
export type Time = bigint;
export interface Mistake {
    id: bigint;
    repeatCount: bigint;
    subject: Subject;
    date: string;
    mistakeType: MistakeType;
    description: string;
    chapterName: string;
}
export interface StudySession {
    id: bigint;
    date: string;
    durationSeconds: bigint;
    notes: string;
}
export interface DailyRecord {
    goalMet: boolean;
    date: string;
    studySeconds: bigint;
    totalPYQs: bigint;
}
export interface PYQEntry {
    id: bigint;
    startTime: Time;
    subject: Subject;
    endTime: Time;
    date: string;
    completed: bigint;
    correct: bigint;
    target: bigint;
    wrong: bigint;
}
export interface Chapter {
    id: bigint;
    tag: ChapterTag;
    status: ChapterStatus;
    mistakeCount: bigint;
    subject: Subject;
    pyqsDone: bigint;
    name: string;
}
export enum ChapterStatus {
    pending = "pending",
    completed = "completed"
}
export enum ChapterTag {
    strong = "strong",
    weakTag = "weakTag",
    neutral = "neutral"
}
export enum MistakeType {
    concept = "concept",
    silly = "silly",
    formula = "formula"
}
export enum Subject {
    maths = "maths",
    chemistry = "chemistry",
    physics = "physics"
}
export interface backendInterface {
    createChapter(chapter: Chapter): Promise<bigint>;
    createMistake(mistake: Mistake): Promise<bigint>;
    createPYQEntry(entry: PYQEntry): Promise<bigint>;
    createStudySession(session: StudySession): Promise<bigint>;
    deleteChapter(id: bigint): Promise<void>;
    deleteMistake(id: bigint): Promise<void>;
    deletePYQEntry(id: bigint): Promise<void>;
    deleteStudySession(id: bigint): Promise<void>;
    getAllDailyRecords(): Promise<Array<DailyRecord>>;
    getChapter(id: bigint): Promise<Chapter>;
    getDailyRecord(date: string): Promise<DailyRecord>;
    getExamConfig(name: string): Promise<ExamConfig>;
    getMistake(id: bigint): Promise<Mistake>;
    getPYQEntry(id: bigint): Promise<PYQEntry>;
    getStudySession(id: bigint): Promise<StudySession>;
    incrementMistakeRepeatCount(id: bigint): Promise<void>;
    setExamConfig(name: string, config: ExamConfig): Promise<void>;
    updateChapter(id: bigint, chapter: Chapter): Promise<void>;
    updatePYQEntry(id: bigint, entry: PYQEntry): Promise<void>;
    updateStudySession(id: bigint, session: StudySession): Promise<void>;
    upsertDailyRecord(record: DailyRecord): Promise<void>;
}
