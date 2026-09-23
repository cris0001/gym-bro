interface PickedExerciseCardProps {
  name: string;
  // Reopens the picker; omitted when the exercise is fixed (editing targets).
  onChange?: () => void;
}

// The chosen exercise shown as a read-only card: a small "Exercise" caption over the
// serif name, with an optional "Change" link back to the picker.
export function PickedExerciseCard({ name, onChange }: PickedExerciseCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e1da] bg-[#fdfbf9] px-4 py-2.5 dark:border-[#2f292d] dark:bg-[#171316]">
      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] font-bold tracking-[0.08em] uppercase">
          Exercise
        </p>
        <p className="font-heading truncate text-base font-semibold">{name}</p>
      </div>
      {onChange ? (
        <button
          type="button"
          className="text-primary shrink-0 text-[12.5px] font-semibold"
          onClick={onChange}
        >
          Change
        </button>
      ) : null}
    </div>
  );
}
