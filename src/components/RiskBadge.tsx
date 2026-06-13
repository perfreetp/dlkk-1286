import clsx from 'clsx';
import type { RiskLevel } from '@/types';
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full border font-medium text-sm',
        RISK_LEVEL_COLORS[level]
      )}
    >
      {RISK_LEVEL_LABELS[level]}
    </span>
  );
}