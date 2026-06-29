// Centered, fixed-height empty/loading state shared by the stat charts so they
// reserve the same vertical space (h-64) whether or not data is present.
export function ChartPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground flex h-64 items-center justify-center text-center text-sm">
      {children}
    </div>
  );
}
