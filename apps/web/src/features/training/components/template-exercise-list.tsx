import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { TemplateExerciseWithExercise } from '@gym-bro/shared';

import { useReorderTemplateExercises } from '../hooks/use-reorder-template-exercises';
import { TemplateExerciseRow } from './template-exercise-row';

interface TemplateExerciseListProps {
  templateId: string;
  templateExercises: TemplateExerciseWithExercise[];
}

// Drag-to-reorder list of a template's exercises. The 8px activation distance
// keeps taps and scrolls from starting a drag; reorder fires the optimistic
// mutation.
export function TemplateExerciseList({ templateId, templateExercises }: TemplateExerciseListProps) {
  const reorder = useReorderTemplateExercises();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = templateExercises.findIndex((e) => e.id === active.id);
    const newIndex = templateExercises.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const orderedIds = arrayMove(templateExercises, oldIndex, newIndex).map((e) => e.id);
    reorder.mutate({ templateId, orderedIds });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={templateExercises.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="divide-y border-t">
          {templateExercises.map((templateExercise) => (
            <TemplateExerciseRow key={templateExercise.id} templateExercise={templateExercise} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
