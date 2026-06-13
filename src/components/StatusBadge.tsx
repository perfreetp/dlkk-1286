import clsx from 'clsx';
import type { VersionStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';

interface StatusBadgeProps {
  status: VersionStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        STATUS_COLORS[status],
        sizeClasses[size]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}