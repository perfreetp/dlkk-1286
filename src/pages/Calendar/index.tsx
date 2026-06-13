import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { formatDate, getWeekDates, getMonthDates, isSameDay, isToday } from '@/utils/date';
import type { Version } from '@/types';

export function Calendar() {
  const navigate = useNavigate();
  const versions = useVersionStore((state) => state.versions);
  const checkConflicts = useVersionStore((state) => state.checkConflicts);
  
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dates = viewMode === 'week' ? getWeekDates(currentDate) : getMonthDates(year, month);

  const getVersionForDate = (date: Date): Version[] => {
    return versions.filter((v) => {
      if (v.status === 'cancelled' || v.status === 'rolled_back') return false;
      const plannedDate = new Date(v.plannedDate);
      return isSameDay(plannedDate, date);
    });
  };

  const hasConflict = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    const conflicting = checkConflicts(dateStr);
    return conflicting.length > 1;
  };

  const goToPrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">版本日历</h2>
          <span className="text-lg text-slate-500">
            {year}年{month + 1}月
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('week')}
              className={clsx(
                'px-4 py-2 text-sm font-medium transition-colors rounded-l-lg',
                viewMode === 'week'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              周视图
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={clsx(
                'px-4 py-2 text-sm font-medium transition-colors rounded-r-lg',
                viewMode === 'month'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              月视图
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            今天
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>

          <button
            onClick={() => navigate('/release')}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            新建版本
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-slate-600 bg-slate-50"
            >
              {day}
            </div>
          ))}
        </div>

        <div className={clsx('grid grid-cols-7', viewMode === 'month' ? 'auto-rows-fr' : '')}>
          {dates.map((date, index) => {
            const dayVersions = getVersionForDate(date);
            const conflict = hasConflict(date);
            const isCurrentMonth = date.getMonth() === month;
            const isCurrentWeek = viewMode === 'week';

            return (
              <div
                key={index}
                className={clsx(
                  'border-b border-r border-slate-200 p-2 min-h-[80px]',
                  !isCurrentMonth && !isCurrentWeek && 'bg-slate-50',
                  isToday(date) && 'bg-orange-50'
                )}
              >
                <div
                  className={clsx(
                    'text-sm mb-2',
                    isToday(date)
                      ? 'font-bold text-orange-600'
                      : isCurrentMonth || isCurrentWeek
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  )}
                >
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayVersions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => navigate(`/release/${version.id}`)}
                      className={clsx(
                        'w-full text-left px-2 py-1 rounded text-xs transition-colors',
                        'hover:shadow-md',
                        conflict
                          ? 'bg-red-100 border border-red-300 text-red-700'
                          : 'bg-blue-100 border border-blue-200 text-blue-700'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {conflict && <AlertTriangle size={12} className="text-red-500" />}
                        <span className="font-medium truncate">{version.versionNumber}</span>
                      </div>
                      <div className="truncate text-xs opacity-75">{version.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">近期版本</h3>
        <div className="space-y-2">
          {versions
            .filter((v) => v.status !== 'cancelled' && v.status !== 'rolled_back')
            .slice(0, 5)
            .map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/release/${version.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800">{version.versionNumber}</span>
                  <span className="text-sm text-slate-600">{version.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge level={version.riskLevel} />
                  <StatusBadge status={version.status} size="sm" />
                  <span className="text-xs text-slate-500">{formatDate(version.plannedDate)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}