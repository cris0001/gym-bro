// Centered, fixed-height empty/loading state shared by the stat charts so they
// reserve the same vertical space (h-64) whether or not data is present.
export function ChartPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground font-heading flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#d6c8bd] dark:border-[#4b3f47] text-center text-sm italic">
      {children}
    </div>
  );
}
