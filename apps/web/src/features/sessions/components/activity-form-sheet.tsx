import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { useState } from 'react';

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

import { useCreateActivitySession } from '../hooks/use-create-activity-session';

interface ActivityFormSheetProps {
  open: boolean;
  onClose: () => void;
}

const today = (): string => format(new Date(), 'yyyy-MM-dd');

const parseDuration = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

// Quick log for an ad-hoc activity (cardio/yoga/sports): just a name + date plus
// optional duration, rating, notes, and tags. No exercises/sets — it POSTs an
// activity session and refreshes history. Plain useState; the only required
// field is the name.
export function ActivityFormSheet({ open, onClose }: ActivityFormSheetProps) {
  const { data: tags = [] } = useTags();
  const createMutation = useCreateActivitySession();

  const [name, setName] = useState('');
  const [performedDate, setPerformedDate] = useState(today);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);

  function reset() {
    setName('');
    setPerformedDate(today());
    setDurationMinutes(null);
    setRating(null);
    setNotes('');
    setTagIds([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function toggleTag(tagId: string) {
    setTagIds((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    );
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    createMutation.mutate(
      {
        name: trimmed,
        performedDate,
        durationMinutes,
        rating,
        notes: notes.trim().length > 0 ? notes.trim() : null,
        tagIds,
      },
      { onSuccess: handleClose },
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && handleClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Log activity</SheetTitle>
          <SheetDescription>A standalone session — cardio, yoga, sports.</SheetDescription>
        </SheetHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <Input
              placeholder="e.g. Morning run"
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Date
            <Input
              type="date"
              className="h-11"
              value={performedDate}
              onChange={(e) => e.target.value && setPerformedDate(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Duration (min)
            <Input
              inputMode="numeric"
              placeholder="Optional"
              className="h-11"
              value={durationMinutes ?? ''}
              onChange={(e) => setDurationMinutes(parseDuration(e.target.value))}
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  onClick={() => setRating(rating === star ? null : star)}
                >
                  <Star
                    className={cn(
                      'size-8',
                      rating && star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Notes
            <textarea
              placeholder="Optional"
              rows={3}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border bg-background px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          {tags.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Tags</span>
              <div className="flex flex-wrap gap-2">
                {tags
                  .filter((tag) => tag.isActive)
                  .map((tag) => {
                    const selected = tagIds.includes(tag.id);
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

          {createMutation.isError && (
            <p className="text-destructive text-sm">{createMutation.error.message}</p>
          )}

          <Button
            className="h-11"
            disabled={name.trim().length === 0 || createMutation.isPending}
            onClick={handleSave}
          >
            {createMutation.isPending ? 'Saving…' : 'Log activity'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
