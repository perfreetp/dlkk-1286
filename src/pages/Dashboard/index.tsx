import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, Play, RotateCcw, XCircle, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/utils/date';
import type { VersionStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

const statusGroups: { status: VersionStatus; icon: React.ElementType; color: string; bgColor: string }[] = [
  { status: 'pending', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
  { status: 'approved', icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  { status: 'testing', icon: AlertTriangle, color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  { status: 'ready', icon: Play, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  { status: 'released', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const versions = useVersionStore((state) => state.versions);

  const statusCounts: Record<VersionStatus, number> = {
    pending: versions.filter((v) => v.status === 'pending').length,
    approved: versions.filter((v) => v.status === 'approved').length,
    testing: versions.filter((v) => v.status === 'testing').length,
    ready: versions.filter((v) => v.status === 'ready').length,
    released: versions.filter((v) => v.status === 'released').length,
    rolled_back: versions.filter((v) => v.status === 'rolled_back').length,
    cancelled: versions.filter((v) => v.status === 'cancelled').length,
  };

  const totalActive = statusCounts.pending + statusCounts.approved + statusCounts.testing + statusCounts.ready;
  const totalReleased = statusCounts.released + statusCounts.rolled_back;

  const getVersionsByStatus = (status: VersionStatus) => {
    return versions.filter((v) => v.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={28} className="text-orange-500" />
          <h2 className="text-2xl font-bold text-slate-800">流程进度总览</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
            <span className="text-sm text-slate-600">进行中：</span>
            <span className="font-bold text-orange-600">{totalActive}</span>
          </div>
          <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm text-slate-600">已发布：</span>
            <span className="font-bold text-green-600">{totalReleased}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {statusGroups.map(({ status, icon: Icon, color, bgColor }) => {
          const count = statusCounts[status];
          const versionList = getVersionsByStatus(status);
          
          return (
            <div
              key={status}
              className={clsx(
                'rounded-xl border-2 p-4 transition-all hover:shadow-lg hover:scale-105 cursor-pointer',
                bgColor
              )}
              onClick={() => navigate(`/versions?status=${status}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={24} className={color} />
                <span className={clsx('text-3xl font-bold', color)}>{count}</span>
              </div>
              <p className="text-sm font-medium text-slate-700">{STATUS_LABELS[status]}</p>
              <p className="text-xs text-slate-500 mt-1">点击查看详情</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {statusGroups.slice(0, 4).map(({ status, icon: Icon, color, bgColor }) => {
          const versionList = getVersionsByStatus(status).slice(0, 5);
          
          return (
            <div key={status} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => navigate(`/versions?status=${status}`)}
                className={clsx(
                  'w-full flex items-center justify-between p-4 border-b transition-colors',
                  bgColor
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={20} className={color} />
                  <span className="font-medium text-slate-700">{STATUS_LABELS[status]}</span>
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs font-bold', color, 'bg-white')}>
                    {statusCounts[status]}
                  </span>
                </div>
                <span className="text-sm text-slate-500">查看全部 →</span>
              </button>
              
              <div className="p-2 max-h-64 overflow-y-auto">
                {versionList.length > 0 ? (
                  versionList.map((version) => (
                    <button
                      key={version.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/release/${version.id}`);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{version.versionNumber}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{version.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{formatDate(version.plannedDate)}</p>
                        <p className="text-xs text-slate-400">{version.owner}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Icon size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无版本</p>
                  </div>
                )}
                {statusCounts[status] > 5 && (
                  <button
                    onClick={() => navigate(`/versions?status=${status}`)}
                    className="w-full p-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    还有 {statusCounts[status] - 5} 个版本，点击查看全部
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b bg-red-50 border-red-200">
            <RotateCcw size={20} className="text-red-500" />
            <span className="font-medium text-slate-700">已回滚</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
              {statusCounts.rolled_back}
            </span>
          </div>
          <div className="p-2">
            {versions
              .filter((v) => v.status === 'rolled_back')
              .slice(0, 3)
              .map((version) => (
                <button
                  key={version.id}
                  onClick={() => navigate(`/release/${version.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-slate-800">{version.versionNumber}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{version.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{formatDate(version.actualDate || version.plannedDate)}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b bg-gray-50 border-gray-200">
            <XCircle size={20} className="text-gray-500" />
            <span className="font-medium text-slate-700">已取消</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
              {statusCounts.cancelled}
            </span>
          </div>
          <div className="p-2">
            {versions
              .filter((v) => v.status === 'cancelled')
              .slice(0, 3)
              .map((version) => (
                <button
                  key={version.id}
                  onClick={() => navigate(`/release/${version.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-slate-800">{version.versionNumber}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{version.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{formatDate(version.plannedDate)}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}