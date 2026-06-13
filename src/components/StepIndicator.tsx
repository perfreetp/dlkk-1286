import { CheckCircle2, Circle, Clock, XCircle, ArrowLeftRight } from 'lucide-react';
import clsx from 'clsx';
import type { VersionStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

interface StepIndicatorProps {
  currentStatus: VersionStatus;
  onStatusChange?: (status: VersionStatus) => void;
  isAdmin?: boolean;
}

const steps: VersionStatus[] = ['pending', 'approved', 'testing', 'ready', 'released'];

const statusIcons: Record<VersionStatus, React.ReactNode> = {
  pending: <Clock size={18} />,
  approved: <CheckCircle2 size={18} />,
  testing: <Circle size={18} />,
  ready: <CheckCircle2 size={18} />,
  released: <CheckCircle2 size={18} />,
  rolled_back: <ArrowLeftRight size={18} />,
  cancelled: <XCircle size={18} />,
};

export function StepIndicator({ currentStatus, onStatusChange, isAdmin = false }: StepIndicatorProps) {
  const currentStepIndex = steps.indexOf(currentStatus);
  const isEnded = currentStatus === 'released' || currentStatus === 'rolled_back' || currentStatus === 'cancelled';

  const canClickStep = (index: number): boolean => {
    if (!onStatusChange || !isAdmin || isEnded) return false;
    return index === currentStepIndex || (isAdmin && index === currentStepIndex + 1);
  };

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex || (isEnded && step === 'released');
        const isCurrent = step === currentStatus;
        const isClickable = canClickStep(index);

        return (
          <div key={step} className="flex items-center">
            <div
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200',
                isCompleted && 'bg-green-100 text-green-700',
                isCurrent && !isEnded && 'bg-orange-100 text-orange-700 ring-2 ring-orange-400',
                !isCompleted && !isCurrent && 'bg-slate-100 text-slate-400',
                isClickable && 'hover:bg-slate-200 cursor-pointer',
                !isClickable && 'cursor-default'
              )}
            >
              {isCompleted ? <CheckCircle2 size={18} /> : statusIcons[step]}
              <span className="text-sm font-medium">{STATUS_LABELS[step]}</span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'w-8 h-0.5 mx-1',
                  isCompleted ? 'bg-green-400' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        );
      })}

      {(currentStatus === 'rolled_back' || currentStatus === 'cancelled') && (
        <div
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            currentStatus === 'rolled_back' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          )}
        >
          {statusIcons[currentStatus]}
          <span className="text-sm font-medium">{STATUS_LABELS[currentStatus]}</span>
        </div>
      )}

      {!isAdmin && !isEnded && (
        <span className="text-xs text-slate-400 ml-2">
          (仅管理员可修改状态)
        </span>
      )}
    </div>
  );
}