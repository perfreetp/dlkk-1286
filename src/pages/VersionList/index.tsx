import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowLeft, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { formatDate } from '@/utils/date';
import type { VersionStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

export function VersionList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') as VersionStatus | null;
  
  const versions = useVersionStore((state) => state.versions);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVersions = versions
    .filter((v) => !statusFilter || v.status === statusFilter)
    .filter((v) => {
      if (!searchQuery) return true;
      return (
        v.versionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">
            {statusFilter ? STATUS_LABELS[statusFilter] : '所有版本'}
          </h2>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
            {filteredVersions.length} 个版本
          </span>
        </div>
        <button
          onClick={() => navigate('/release')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={18} />
          新建版本
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索版本号或标题..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter || ''}
              onChange={(e) => {
                const status = e.target.value;
                navigate(status ? `/versions?status=${status}` : '/versions');
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
            >
              <option value="">全部状态</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredVersions.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">版本号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">风险</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">计划日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">负责人</th>
              </tr>
            </thead>
            <tbody>
              {filteredVersions.map((version) => (
                <tr
                  key={version.id}
                  onClick={() => navigate(`/release/${version.id}`)}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">{version.versionNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{version.title}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs">{version.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={version.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={version.riskLevel} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(version.plannedDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{version.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">没有找到匹配的版本</p>
          <button
            onClick={() => navigate('/release')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            新建版本
          </button>
        </div>
      )}
    </div>
  );
}