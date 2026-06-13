import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { ChecklistItem, ChecklistCategory } from '@/types';
import { CHECKLIST_CATEGORY_LABELS } from '@/types';

interface ChecklistGroupProps {
  category: ChecklistCategory;
  items: ChecklistItem[];
  onItemChange?: (itemId: string, checked: boolean, note?: string) => void;
  readOnly?: boolean;
}

export function ChecklistGroup({ category, items, onItemChange, readOnly = false }: ChecklistGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={20} className="text-slate-400" />
          ) : (
            <ChevronRight size={20} className="text-slate-400" />
          )}
          <span className="font-medium text-slate-800">
            {CHECKLIST_CATEGORY_LABELS[category]}
          </span>
          <span className="text-sm text-slate-500">
            {completedCount}/{items.length} 完成
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full transition-all duration-300',
                progress === 100 ? 'bg-green-500' : progress > 50 ? 'bg-orange-400' : 'bg-slate-400'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600">{Math.round(progress)}%</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 p-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-lg transition-colors',
                item.checked ? 'bg-green-50' : 'bg-slate-50'
              )}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => !readOnly && onItemChange?.(item.id, e.target.checked)}
                disabled={readOnly}
                className={clsx(
                  'mt-1 w-4 h-4 rounded border-2 transition-colors cursor-pointer',
                  item.checked
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-300 hover:border-orange-400',
                  readOnly && 'cursor-default'
                )}
              />

              <div className="flex-1">
                <p className={clsx('font-medium', item.checked ? 'text-green-700' : 'text-slate-700')}>
                  {item.title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                {!readOnly && item.checked && (
                  <input
                    type="text"
                    placeholder="添加备注..."
                    value={item.note || ''}
                    onChange={(e) => onItemChange?.(item.id, true, e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-orange-400"
                  />
                )}
                {readOnly && item.note && (
                  <p className="text-sm text-slate-600 mt-1 bg-white px-2 py-1 rounded">
                    备注: {item.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}