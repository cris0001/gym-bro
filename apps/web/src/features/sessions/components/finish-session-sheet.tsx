import { useNavigate } from '@tanstack/react-router';
import { Star } from 'lucide-react';

import type { CreateStrengthSessionInput } from '@gym-bro/shared';

import { useTags } from '@/features/training';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import type { WorkoutDraft } from '../stores/workout-draft.store';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { useCreateStrengthSession } from '../hooks/use-create-strength-session';
import { useUpdateStrengthSession } from '../hooks/use-update-strength-session';

interface FinishSessionSheetProps {
  open: boolean;
  onClose: () => void;
}

// Maps the in-progress draft to the strength-session create payload. Position is
// implicit in array order on the server; client-side ids are dropped here.
function buildPayload(draft: WorkoutDraft): CreateStrengthSessionInput {
  return {
    plannedSessionId: draft.plannedSessionId,
    workoutTemplateId: draft.workoutTemplateId,
    name: draft.name,
    performedDate: draft.performedDate,
    durationMinutes: draft.durationMinutes,
    rating: draft.rating,
    notes: draft.notes,
    tagIds: draft.tagIds,
    performances: draft.performances.map((performance) => ({
      originalExerciseId: performance.originalExerciseId,
      actualExerciseId: performance.actualExerciseId,
      notes: performance.notes,
      sets: performance.sets.map((set) => ({
        // A bodyweight set already has a null weight in the draft; only the
        // top-set flag needs forwarding (the server defaults it to false).
        weight: set.weight,
        reps: set.reps,
        rir: set.rir,
        isTopSet: set.isTopSet,
      })),
    })),
  };
}

const parseDuration = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

// The finish-workout form: optional star rating, duration, notes, and tags, then
// submit. Fields write to the persisted draft (F5-safe). Submit is blocked until
// the session is valid (≥1 exercise, each with ≥1 set); on success the draft is
// cleared and the sheet closes.
export function FinishSessionSheet({ open, onClose }: FinishSessionSheetProps) {
  const { data: tags = [] } = useTags();
  const draft = useWorkoutDraftStore((s) => s.draft);
  const setDuration = useWorkoutDraftStore((s) => s.setDuration);
  const setRating = useWorkoutDraftStore((s) => s.setRating);
  const setNotes = useWorkoutDraftStore((s) => s.setNotes);
  const setTags = useWorkoutDraftStore((s) => s.setTags);
  const discard = useWorkoutDraftStore((s) => s.discard);
  const createMutation = useCreateStrengthSession();
  const updateMutation = useUpdateStrengthSession();
  const navigate = useNavigate();

  if (!draft) return null;

  const isEditing = draft.editingSessionId !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const validationError =
    draft.performances.length === 0
      ? 'Add at least one exercise before finishing.'
      : draft.performances.some((p) => p.sets.length === 0)
        ? 'Every exercise needs at least one set.'
        : null;

  function toggleTag(tagId: string) {
    if (!draft) return;
    const next = draft.tagIds.includes(tagId)
      ? draft.tagIds.filter((id) => id !== tagId)
      : [...draft.tagIds, tagId];
    setTags(next);
  }

  function handleFinish() {
    if (!draft || validationError) return;
    const payload = buildPayload(draft);
    const editingId = draft.editingSessionId;
    if (editingId !== null) {
      updateMutation.mutate(
        { id: editingId, input: payload },
        {
          onSuccess: () => {
            discard();
            onClose();
            void navigate({ to: '/history/$sessionId', params: { sessionId: editingId } });
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          discard();
          onClose();
        },
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Save changes' : 'Finish workout'}</SheetTitle>
          <SheetDescription>Rate it and add tags, then save.</SheetDescription>
        </SheetHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  onClick={() => setRating(draft.rating === star ? null : star)}
                >
                  <Star
                    className={cn(
                      'size-8',
                      draft.rating && star <= draft.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Duration (min)
            <Input
              inputMode="numeric"
              placeholder="Optional"
              className="h-11"
              value={draft.durationMinutes ?? ''}
              onChange={(e) => setDuration(parseDuration(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Notes
            <textarea
              placeholder="Optional"
              rows={3}
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
              value={draft.notes ?? ''}
              onChange={(e) => setNotes(e.target.value.length > 0 ? e.target.value : null)}
            />
          </label>

          {tags.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Tags</span>
              <div className="flex flex-wrap gap-2">
                {tags
                  .filter((tag) => tag.isActive)
                  .map((tag) => {
                    const selected = draft.tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          'min-h-9 rounded-full border px-3 text-sm transition-colors',
                          selected ? 'border-transparent text-white' : 'text-foreground',
                        )}
                        style={selected ? { backgroundColor: tag.color } : undefined}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {validationError && <p className="text-destructive text-sm">{validationError}</p>}
          {mutationError && <p className="text-destructive text-sm">{mutationError.message}</p>}

          <Button
            className="h-11"
            disabled={validationError !== null || isPending}
            onClick={handleFinish}
          >
            {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Finish workout'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
