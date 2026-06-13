import { Circle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import clsx from 'clsx';
import type { TimelineEvent } from '@/types';
import { formatDateTime } from '@/utils/date';

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

      <div className="space-y-4">
        {sortedEvents.map((event, index) => {
          const isFirst = index === 0;
          const isLast = index === sortedEvents.length - 1;

          return (
            <div key={event.id} className="relative pl-10">
              <div
                className={clsx(
                  'absolute left-2.5 top-1.5 w-5 h-5 rounded-full flex items-center justify-center',
                  isFirst ? 'bg-green-500' : isLast ? 'bg-orange-500' : 'bg-slate-300'
                )}
              >
                {isFirst ? (
                  <CheckCircle2 size={14} className="text-white" />
                ) : isLast ? (
                  <AlertTriangle size={14} className="text-white" />
                ) : (
                  <Circle size={14} className="text-white" />
                )}
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4 hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{event.title}</span>
                  <span className="text-xs text-slate-500">{formatDateTime(event.time)}</span>
                </div>
                <p className="text-sm text-slate-600">{event.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                  <Clock size={12} />
                  <span>{event.user}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}