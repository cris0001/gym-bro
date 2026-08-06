import abdominalArmor from '@iconify-icons/game-icons/abdominal-armor';
import backMuscles from '@iconify-icons/game-icons/back-pain';
import biceps from '@iconify-icons/game-icons/biceps';
import forearm from '@iconify-icons/game-icons/forearm';
import heartBeats from '@iconify-icons/game-icons/heart-beats';
import leg from '@iconify-icons/game-icons/leg';
import shoulderPress from '@iconify-icons/game-icons/weight-lifting-up';
import chest from '@iconify-icons/icon-park-outline/chest';
import { Icon, type IconifyIcon } from '@iconify/react';
import { Shapes } from 'lucide-react';

import type { ExerciseCategory } from '@gym-bro/shared';

// A body-part glyph per category, from Iconify sets (game-icons for the muscle groups,
// icon-park-outline for chest). Icon data is imported and passed inline, so nothing is
// fetched at runtime (no CDN). Only "Other" has no anatomical glyph — it falls back to
// lucide's Shapes.
const ICONIFY_ICONS: Partial<Record<ExerciseCategory, IconifyIcon>> = {
  Chest: chest,
  Back: backMuscles,
  Legs: leg,
  Shoulders: shoulderPress,
  Biceps: biceps,
  Triceps: forearm,
  Abs: abdominalArmor,
  Cardio: heartBeats,
};

// One decorative icon for a body-part category. Colour follows currentColor; size via
// className (e.g. "size-4").
export function CategoryIcon({
  category,
  className,
}: {
  category: ExerciseCategory;
  className?: string;
}) {
  const icon = ICONIFY_ICONS[category];
  if (icon) {
    return <Icon icon={icon} className={className} aria-hidden />;
  }
  return <Shapes className={className} aria-hidden />;
}
