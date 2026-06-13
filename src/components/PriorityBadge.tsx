import clsx from 'clsx';
import type { Priority } from '@/types';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/types';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded border font-medium text-xs',
        PRIORITY_COLORS[priority]
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}