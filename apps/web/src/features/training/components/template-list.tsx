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

import type { WorkoutTemplate } from '@gym-bro/shared';

import { useReorderTemplates } from '../hooks/use-reorder-templates';
import { TemplateRow } from './template-row';

interface TemplateListProps {
  planId: string;
  templates: WorkoutTemplate[];
}

// Drag-to-reorder list of a plan's templates. The 8px activation distance keeps
// taps and scrolls from starting a drag; reorder fires the optimistic mutation.
export function TemplateList({ planId, templates }: TemplateListProps) {
  const reorder = useReorderTemplates();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = templates.findIndex((t) => t.id === active.id);
    const newIndex = templates.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const orderedIds = arrayMove(templates, oldIndex, newIndex).map((t) => t.id);
    reorder.mutate({ planId, orderedIds });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={templates.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y border-t">
          {templates.map((template) => (
            <TemplateRow key={template.id} template={template} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
