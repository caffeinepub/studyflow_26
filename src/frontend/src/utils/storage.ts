import type {
  Chapter,
  DailyRecord,
  ExamConfig,
  Mistake,
  PYQDayData,
  PYQSubjectData,
  StudySession,
  Subject,
} from "../types/studyflow";

const KEY = {
  exam: "studyflow_exam",
  pyqDays: "studyflow_pyq_days",
  chapters: "studyflow_chapters",
  mistakes: "studyflow_mistakes",
  sessions: "studyflow_sessions",
  dailyRecords: "studyflow_daily_records",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const DEFAULT_SUBJECT_DATA: PYQSubjectData = {
  target: 27,
  completed: 0,
  correct: 0,
  wrong: 0,
  studyMinutes: 0,
};

const DEFAULT_EXAM: ExamConfig = {
  examName: "JEE Main 2025",
  examDate: "2026-01-22",
  dailyGoal: 80,
  weeklyGoal: 500,
};

const DEFAULT_CHAPTERS: Chapter[] = [
  {
    id: "p1",
    subject: "physics",
    name: "Mechanics",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "p2",
    subject: "physics",
    name: "Optics",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "p3",
    subject: "physics",
    name: "Electromagnetism",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "c1",
    subject: "chemistry",
    name: "Organic Chemistry",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "c2",
    subject: "chemistry",
    name: "Physical Chemistry",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "c3",
    subject: "chemistry",
    name: "Inorganic Chemistry",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "m1",
    subject: "maths",
    name: "Calculus",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "m2",
    subject: "maths",
    name: "Algebra",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
  {
    id: "m3",
    subject: "maths",
    name: "Coordinate Geometry",
    pyqsDone: 0,
    status: "pending",
    tag: "neutral",
    mistakeCount: 0,
  },
];

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getExamConfig(): ExamConfig {
  return load(KEY.exam, DEFAULT_EXAM);
}
export function setExamConfig(c: ExamConfig): void {
  save(KEY.exam, c);
}

export function getPYQDays(): PYQDayData[] {
  return load(KEY.pyqDays, []);
}

export function getTodayPYQ(): PYQDayData {
  const days = getPYQDays();
  const today = todayStr();
  const existing = days.find((d) => d.date === today);
  if (existing) return existing;
  return {
    date: today,
    physics: { ...DEFAULT_SUBJECT_DATA },
    chemistry: { ...DEFAULT_SUBJECT_DATA },
    maths: { ...DEFAULT_SUBJECT_DATA },
  };
}

export function saveTodayPYQ(data: PYQDayData): void {
  const days = getPYQDays().filter((d) => d.date !== data.date);
  save(KEY.pyqDays, [...days, data]);
}

export function getChapters(): Chapter[] {
  const stored = load<Chapter[] | null>(KEY.chapters, null);
  if (stored === null) {
    save(KEY.chapters, DEFAULT_CHAPTERS);
    return DEFAULT_CHAPTERS;
  }
  return stored;
}
export function saveChapters(chapters: Chapter[]): void {
  save(KEY.chapters, chapters);
}

export function getMistakes(): Mistake[] {
  return load(KEY.mistakes, []);
}
export function saveMistakes(m: Mistake[]): void {
  save(KEY.mistakes, m);
}

export function getSessions(): StudySession[] {
  return load(KEY.sessions, []);
}
export function saveSessions(s: StudySession[]): void {
  save(KEY.sessions, s);
}

export function getDailyRecords(): DailyRecord[] {
  return load(KEY.dailyRecords, []);
}
export function saveDailyRecords(r: DailyRecord[]): void {
  save(KEY.dailyRecords, r);
}

export function upsertDailyRecord(record: DailyRecord): void {
  const records = getDailyRecords().filter((r) => r.date !== record.date);
  saveDailyRecords([...records, record]);
}

export function getStreaks(): { current: number; best: number } {
  const records = getDailyRecords();
  const goalMet = new Set(records.filter((r) => r.goalMet).map((r) => r.date));
  const today = new Date();
  let current = 0;
  const d = new Date(today);
  while (true) {
    const ds = d.toISOString().slice(0, 10);
    if (goalMet.has(ds)) {
      current++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  let best = 0;
  let run = 0;
  const sorted = records
    .filter((r) => r.goalMet)
    .map((r) => r.date)
    .sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      run = 1;
      best = 1;
      continue;
    }
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      run++;
      if (run > best) best = run;
    } else run = 1;
  }
  return { current, best: Math.max(best, current) };
}

export function getTodayStudySeconds(): number {
  const sessions = getSessions();
  const today = todayStr();
  return sessions
    .filter((s) => s.date === today)
    .reduce((acc, s) => acc + s.durationSeconds, 0);
}

export function getWeeklyStudySeconds(): number {
  const sessions = getSessions();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return sessions
    .filter((s) => new Date(s.date) >= weekAgo)
    .reduce((acc, s) => acc + s.durationSeconds, 0);
}

export function getLast14DaysPYQ(): {
  date: string;
  total: number;
  accuracy: number;
}[] {
  const days = getPYQDays();
  const result: { date: string; total: number; accuracy: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const day = days.find((x) => x.date === ds);
    const total = day
      ? day.physics.completed + day.chemistry.completed + day.maths.completed
      : 0;
    const correct = day
      ? day.physics.correct + day.chemistry.correct + day.maths.correct
      : 0;
    const wrong = day
      ? day.physics.wrong + day.chemistry.wrong + day.maths.wrong
      : 0;
    const accuracy =
      correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
    result.push({ date: ds, total, accuracy });
  }
  return result;
}

export function subjectTotals(): {
  physics: number;
  chemistry: number;
  maths: number;
} {
  const days = getPYQDays();
  const physics = days.reduce((a, d) => a + d.physics.completed, 0);
  const chemistry = days.reduce((a, d) => a + d.chemistry.completed, 0);
  const maths = days.reduce((a, d) => a + d.maths.completed, 0);
  return { physics, chemistry, maths };
}

export function getMonthCalendar(
  year: number,
  month: number,
): { date: string; state: "complete" | "missed" | "none" }[] {
  const records = getDailyRecords();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: { date: string; state: "complete" | "missed" | "none" }[] = [];
  const today = todayStr();
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (ds > today) {
      result.push({ date: ds, state: "none" as const });
      continue;
    }
    const rec = records.find((r) => r.date === ds);
    if (!rec || rec.totalPYQs === 0)
      result.push({ date: ds, state: "none" as const });
    else if (rec.goalMet) result.push({ date: ds, state: "complete" as const });
    else result.push({ date: ds, state: "missed" as const });
  }
  return result;
}

export function subjectLabel(s: Subject): string {
  return s === "physics"
    ? "Physics"
    : s === "chemistry"
      ? "Chemistry"
      : "Maths";
}
