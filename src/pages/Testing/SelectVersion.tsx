import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useVersionStore } from '@/stores/versionStore';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { formatDate } from '@/utils/date';

export function TestingSelect() {
  const navigate = useNavigate();
  const versions = useVersionStore((state) => state.versions);

  const eligibleVersions = versions.filter(
    (v) => v.status === 'approved' || v.status === 'testing' || v.status === 'ready'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">测试准入</h2>
        <p className="text-sm text-slate-500">选择要进行测试准入的版本</p>
      </div>

      {eligibleVersions.length > 0 ? (
        <div className="space-y-3">
          {eligibleVersions.map((version) => (
            <button
              key={version.id}
              onClick={() => navigate(`/testing/${version.id}`)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">{version.versionNumber}</span>
                    <span className="text-slate-600">{version.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>计划日期: {formatDate(version.plannedDate)}</span>
                    <span>负责人: {version.owner}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RiskBadge level={version.riskLevel} />
                <StatusBadge status={version.status} />
                <ArrowRight size={20} className="text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-2">暂无需要测试准入的版本</p>
          <p className="text-sm text-slate-400">请先在发布单中提交版本审核</p>
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          <strong>提示：</strong>只有状态为「审核通过」「测试中」「待发布」的版本才能进行测试准入操作。
        </p>
      </div>
    </div>
  );
}