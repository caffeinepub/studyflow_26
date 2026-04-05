import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import type { Chapter, ChapterTag, Subject } from "../types/studyflow";
import { getChapters, getMistakes, saveChapters } from "../utils/storage";

const SUBJECT_TABS: { id: Subject; label: string }[] = [
  { id: "physics", label: "Physics" },
  { id: "chemistry", label: "Chemistry" },
  { id: "maths", label: "Maths" },
];

const TAG_COLORS: Record<
  ChapterTag,
  { bg: string; text: string; label: string }
> = {
  weak: { bg: "rgba(0,0,0,0.05)", text: "#333333", label: "Weak" },
  strong: { bg: "rgba(0,0,0,0.05)", text: "#333333", label: "Strong" },
  neutral: { bg: "rgba(0,0,0,0.05)", text: "#333333", label: "Neutral" },
};

export default function Chapters() {
  const [activeSubject, setActiveSubject] = useState<Subject>("physics");
  const [chapters, setChapters] = useState<Chapter[]>(getChapters);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const mistakes = getMistakes();

  const subjectChapters = chapters.filter((c) => c.subject === activeSubject);

  const update = (id: string, patch: Partial<Chapter>) => {
    const updated = chapters.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setChapters(updated);
    saveChapters(updated);
  };

  const addChapter = () => {
    if (!newName.trim()) return;
    const chapter: Chapter = {
      id: `${activeSubject}-${Date.now()}`,
      subject: activeSubject,
      name: newName.trim(),
      pyqsDone: 0,
      status: "pending",
      tag: "neutral",
      mistakeCount: 0,
    };
    const updated = [...chapters, chapter];
    setChapters(updated);
    saveChapters(updated);
    setNewName("");
    setShowAdd(false);
  };

  const removeChapter = (id: string) => {
    const updated = chapters.filter((c) => c.id !== id);
    setChapters(updated);
    saveChapters(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const chapterMistakeCount = (name: string) =>
    mistakes.filter(
      (m) =>
        m.subject === activeSubject &&
        m.chapterName.toLowerCase() === name.toLowerCase(),
    ).length;

  const tagCycle = (tag: ChapterTag): ChapterTag => {
    if (tag === "neutral") return "strong";
    if (tag === "strong") return "weak";
    return "neutral";
  };

  const completedCount = subjectChapters.filter(
    (c) => c.status === "completed",
  ).length;

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Chapters</h1>
        <p className="text-[#666666] text-sm mt-0.5">
          {completedCount}/{subjectChapters.length} completed in {activeSubject}
        </p>
      </div>

      {/* Subject tabs */}
      <div className="flex gap-2 mb-4">
        {SUBJECT_TABS.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            data-ocid={`chapters.${id}.tab`}
            onClick={() => setActiveSubject(id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeSubject === id
                ? "bg-[#111111] text-white shadow-sm"
                : "bg-white/50 text-[#666666] hover:bg-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Weak chapter suggestions */}
      {subjectChapters
        .filter((c) => c.tag === "weak" && chapterMistakeCount(c.name) > 0)
        .map((c) => (
          <div
            key={c.id}
            className="mb-2 px-3 py-2 rounded-xl bg-black/5 border border-black/10"
          >
            <p className="text-xs font-semibold text-[#444444]">
              ⚠️ Revise: {c.name} ({chapterMistakeCount(c.name)} mistakes)
            </p>
          </div>
        ))}

      {/* Chapter list */}
      {subjectChapters.map((chapter, idx) => {
        const isOpen = expandedId === chapter.id;
        const mCount = chapterMistakeCount(chapter.name);
        const tagInfo = TAG_COLORS[chapter.tag];
        return (
          <GlassCard
            key={chapter.id}
            className="mb-2 cursor-pointer"
            data-ocid={`chapters.item.${idx + 1}`}
            onClick={() => setExpandedId(isOpen ? null : chapter.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    update(chapter.id, {
                      status:
                        chapter.status === "completed"
                          ? "pending"
                          : "completed",
                    });
                  }}
                  data-ocid={`chapters.checkbox.${idx + 1}`}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    chapter.status === "completed"
                      ? "bg-[#111111] border-[#111111]"
                      : "border-[#D1D5DB]"
                  }`}
                >
                  {chapter.status === "completed" && (
                    <span className="text-white text-[9px]">✓</span>
                  )}
                </button>
                <p
                  className={`text-sm font-semibold ${
                    chapter.status === "completed"
                      ? "line-through text-[#AAAAAA]"
                      : "text-[#0A0A0A]"
                  }`}
                >
                  {chapter.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    update(chapter.id, { tag: tagCycle(chapter.tag) });
                  }}
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: tagInfo.bg, color: tagInfo.text }}
                >
                  {tagInfo.label}
                </button>
                {mCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-black/5 text-[#444444] text-[9px] font-bold">
                    {mCount}
                  </span>
                )}
              </div>
            </div>

            {isOpen && (
              <div
                className="mt-3 pt-3 border-t border-white/40"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#666666]">PYQs Done</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        update(chapter.id, {
                          pyqsDone: Math.max(0, chapter.pyqsDone - 1),
                        })
                      }
                      className="w-6 h-6 rounded-full bg-white/60 text-xs text-[#666666] font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-[#0A0A0A] w-6 text-center">
                      {chapter.pyqsDone}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        update(chapter.id, { pyqsDone: chapter.pyqsDone + 1 })
                      }
                      className="w-6 h-6 rounded-full bg-white/60 text-xs font-bold text-[#444444]"
                    >
                      +
                    </button>
                  </div>
                </div>
                {mCount > 2 && (
                  <p className="text-[10px] text-[#444444] font-semibold mb-2">
                    📖 Suggest: Revise this chapter — {mCount} mistakes logged
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removeChapter(chapter.id)}
                  data-ocid={`chapters.delete_button.${idx + 1}`}
                  className="text-[10px] text-[#888888] hover:text-[#444444] hover:underline"
                >
                  Remove chapter
                </button>
              </div>
            )}
          </GlassCard>
        );
      })}

      {/* Add chapter */}
      {showAdd ? (
        <GlassCard className="mt-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChapter()}
            placeholder="Chapter name..."
            data-ocid="chapters.input"
            className="w-full bg-transparent text-sm font-semibold text-[#0A0A0A] placeholder-[#AAAAAA] outline-none mb-3"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addChapter}
              data-ocid="chapters.submit_button"
              className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-[#111111]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              data-ocid="chapters.cancel_button"
              className="flex-1 py-1.5 rounded-xl text-xs font-bold text-[#666666] bg-white/50"
            >
              Cancel
            </button>
          </div>
        </GlassCard>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          data-ocid="chapters.open_modal_button"
          className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-black/15 text-sm font-semibold text-[#666666] hover:border-black/30 hover:text-[#111111] transition-colors"
        >
          + Add Chapter
        </button>
      )}
    </div>
  );
}
