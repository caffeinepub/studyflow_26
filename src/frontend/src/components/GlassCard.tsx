import type React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
  children: React.ReactNode;
}

export default function GlassCard({
  strong,
  children,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`${strong ? "glass-card-strong" : "glass-card"} p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
