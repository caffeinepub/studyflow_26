import {
  AlertCircle,
  BarChart2,
  BookMarked,
  BookOpen,
  LayoutDashboard,
  Settings,
  Timer,
} from "lucide-react";
import type React from "react";

export type Tab =
  | "dashboard"
  | "pyq"
  | "chapters"
  | "mistakes"
  | "timer"
  | "analytics"
  | "settings";

const TABS: {
  id: Tab;
  label: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number }>;
}[] = [
  { id: "dashboard", label: "Home", Icon: LayoutDashboard },
  { id: "pyq", label: "PYQ", Icon: BookOpen },
  { id: "chapters", label: "Chapters", Icon: BookMarked },
  { id: "mistakes", label: "Mistakes", Icon: AlertCircle },
  { id: "timer", label: "Timer", Icon: Timer },
  { id: "analytics", label: "Analytics", Icon: BarChart2 },
  { id: "settings", label: "Settings", Icon: Settings },
];

interface BottomTabBarProps {
  active: Tab;
  onChange: (t: Tab) => void;
}

export default function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
      <div className="glass-tab-bar px-3 py-2 flex gap-1 pointer-events-auto">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-2xl transition-all duration-200 min-w-0 ${
                isActive
                  ? "bg-white/80 text-[#111111] shadow-sm"
                  : "text-[#AAAAAA] hover:text-[#555555] hover:bg-white/40"
              }`}
              style={{
                minWidth: 44,
                ...(isActive
                  ? {
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    }
                  : {}),
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
              <span
                className={`text-[9px] mt-0.5 font-semibold tracking-wide leading-none ${
                  isActive ? "text-[#111111]" : ""
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
