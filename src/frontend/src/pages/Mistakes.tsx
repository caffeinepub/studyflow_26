import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import type { Mistake, MistakeType, Subject } from "../types/studyflow";
import {
  getChapters,
  getMistakes,
  saveMistakes,
  todayStr,
} from "../utils/storage";

const SUBJECTS: Subject[] = ["physics", "chemistry", "maths"];
const TYPES: MistakeType[] = ["concept", "silly", "formula"];

const TYPE_COLORS: Record<MistakeType, { bg: string; text: string }> = {
  concept: { bg: "rgba(0,0,0,0.05)", text: "#333333" },
  silly: { bg: "rgba(0,0,0,0.05)", text: "#333333" },
  formula: { bg: "rgba(0,0,0,0.05)", text: "#333333" },
};

const SUBJECT_COLORS: Record<Subject, string> = {
  physics: "#111111",
  chemistry: "#333333",
  maths: "#555555",
};

export default function Mistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>(getMistakes);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<MistakeType | "all">("all");
  const [reviseMode, setReviseMode] = useState(false);
  const [form, setForm] = useState({
    subject: "physics" as Subject,
    chapter: "",
    type: "concept" as MistakeType,
    description: "",
  });
  const chapters = getChapters();

  const addMistake = () => {
    if (!form.description.trim()) return;
    const m: Mistake = {
      id: `m-${Date.now()}`,
      subject: form.subject,
      chapterName: form.chapter,
      mistakeType: form.type,
      description: form.description.trim(),
      date: todayStr(),
      repeatCount: 0,
    };
    const updated = [...mistakes, m];
    setMistakes(updated);
    saveMistakes(updated);
    setForm({
      subject: "physics",
      chapter: "",
      type: "concept",
      description: "",
    });
    setShowAdd(false);
  };

  const increment = (id: string) => {
    const updated = mistakes.map((m) =>
      m.id === id ? { ...m, repeatCount: m.repeatCount + 1 } : m,
    );
    setMistakes(updated);
    saveMistakes(updated);
  };

  const remove = (id: string) => {
    const updated = mistakes.filter((m) => m.id !== id);
    setMistakes(updated);
    saveMistakes(updated);
  };

  const filtered = mistakes.filter(
    (m) => filter === "all" || m.mistakeType === filter,
  );
  const displayed = reviseMode
    ? [...filtered].sort(() => Math.random() - 0.5)
    : filtered;

  const weakestSubject = (): string => {
    const counts: Record<Subject, number> = {
      physics: 0,
      chemistry: 0,
      maths: 0,
    };
    for (const m of mistakes) {
      counts[m.subject]++;
    }
    return (
      (Object.entries(counts) as [Subject, number][]).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0] || "--"
    );
  };

  const mostCommonType = (): MistakeType | "--" => {
    const counts: Record<MistakeType, number> = {
      concept: 0,
      silly: 0,
      formula: 0,
    };
    for (const m of mistakes) {
      counts[m.mistakeType]++;
    }
    const sorted = (Object.entries(counts) as [MistakeType, number][]).sort(
      (a, b) => b[1] - a[1],
    );
    return sorted[0]?.[1] > 0 ? sorted[0][0] : "--";
  };

  const subjectChapters = chapters
    .filter((c) => c.subject === form.subject)
    .map((c) => c.name);

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Mistakes</h1>
          <p className="text-[#666666] text-sm">{mistakes.length} logged</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          data-ocid="mistakes.open_modal_button"
          className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-[#111111]"
        >
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {/* Summary */}
      <GlassCard className="mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-[#0A0A0A]">
              {mistakes.length}
            </p>
            <p className="text-[10px] text-[#666666]">Total</p>
          </div>
          <div>
            <p
              className="text-sm font-bold capitalize"
              style={{
                color:
                  TYPE_COLORS[mostCommonType() as MistakeType]?.text ||
                  "#666666",
              }}
            >
              {mostCommonType()}
            </p>
            <p className="text-[10px] text-[#666666]">Most common</p>
          </div>
          <div>
            <p
              className="text-sm font-bold capitalize"
              style={{
                color: SUBJECT_COLORS[weakestSubject() as Subject] || "#666666",
              }}
            >
              {weakestSubject()}
            </p>
            <p className="text-[10px] text-[#666666]">Weakest</p>
          </div>
        </div>
      </GlassCard>

      {/* Add form */}
      {showAdd && (
        <GlassCard strong className="mb-4" data-ocid="mistakes.dialog">
          <p className="text-sm font-bold text-[#0A0A0A] mb-3">Add Mistake</p>
          <select
            value={form.subject}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                subject: e.target.value as Subject,
                chapter: "",
              }))
            }
            data-ocid="mistakes.select"
            className="w-full bg-white/50 rounded-xl px-3 py-2 text-sm text-[#0A0A0A] mb-2 outline-none border border-white/40"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          {subjectChapters.length > 0 ? (
            <select
              value={form.chapter}
              onChange={(e) =>
                setForm((f) => ({ ...f, chapter: e.target.value }))
              }
              className="w-full bg-white/50 rounded-xl px-3 py-2 text-sm text-[#0A0A0A] mb-2 outline-none border border-white/40"
            >
              <option value="">Select chapter</option>
              {subjectChapters.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={form.chapter}
              onChange={(e) =>
                setForm((f) => ({ ...f, chapter: e.target.value }))
              }
              placeholder="Chapter name"
              data-ocid="mistakes.input"
              className="w-full bg-white/50 rounded-xl px-3 py-2 text-sm text-[#0A0A0A] mb-2 outline-none border border-white/40 placeholder-[#AAAAAA]"
            />
          )}
          <div className="flex gap-2 mb-2">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all capitalize"
                style={
                  form.type === t
                    ? {
                        background: "rgba(0,0,0,0.08)",
                        color: "#111111",
                        border: "1px solid rgba(0,0,0,0.15)",
                      }
                    : { background: "rgba(255,255,255,0.5)", color: "#888888" }
                }
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Describe the mistake..."
            rows={2}
            data-ocid="mistakes.textarea"
            className="w-full bg-white/50 rounded-xl px-3 py-2 text-sm text-[#0A0A0A] mb-3 outline-none border border-white/40 placeholder-[#AAAAAA] resize-none"
          />
          <button
            type="button"
            onClick={addMistake}
            data-ocid="mistakes.submit_button"
            className="w-full py-2 rounded-xl text-sm font-bold text-white bg-[#111111]"
          >
            Log Mistake
          </button>
        </GlassCard>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1 flex-1">
          {(["all", ...TYPES] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setFilter(t)}
              data-ocid={`mistakes.${t}.tab`}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-all ${
                filter === t
                  ? "bg-[#111111] text-white"
                  : "bg-white/50 text-[#666666]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setReviseMode(!reviseMode)}
          data-ocid="mistakes.revise.toggle"
          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
            reviseMode
              ? "bg-[#111111] text-white"
              : "bg-white/50 text-[#666666]"
          }`}
        >
          📚 Revise
        </button>
      </div>

      {/* Mistake list */}
      {displayed.length === 0 ? (
        <div
          className="text-center py-12 text-[#AAAAAA]"
          data-ocid="mistakes.empty_state"
        >
          <p className="text-4xl mb-2">✅</p>
          <p className="text-sm font-medium">No mistakes logged yet</p>
        </div>
      ) : (
        displayed.map((m, idx) => (
          <GlassCard
            key={m.id}
            className="mb-2"
            data-ocid={`mistakes.item.${idx + 1}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full capitalize"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      color: SUBJECT_COLORS[m.subject],
                    }}
                  >
                    {m.subject}
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                    style={{
                      background: TYPE_COLORS[m.mistakeType].bg,
                      color: TYPE_COLORS[m.mistakeType].text,
                    }}
                  >
                    {m.mistakeType}
                  </span>
                  {m.chapterName && (
                    <span className="text-[9px] text-[#AAAAAA]">
                      {m.chapterName}
                    </span>
                  )}
                  {m.repeatCount > 0 && (
                    <span className="text-[9px] font-bold text-[#444444] bg-black/5 px-1.5 py-0.5 rounded-full">
                      ×{m.repeatCount + 1}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#444444] leading-relaxed">
                  {m.description}
                </p>
                <p className="text-[9px] text-[#AAAAAA] mt-1">{m.date}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => increment(m.id)}
                  data-ocid={`mistakes.edit_button.${idx + 1}`}
                  className="w-7 h-7 rounded-full bg-black/5 text-[#444444] text-xs font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  data-ocid={`mistakes.delete_button.${idx + 1}`}
                  className="w-7 h-7 rounded-full bg-black/5 text-[#888888] text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}
