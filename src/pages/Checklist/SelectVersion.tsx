import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useVersionStore } from '@/stores/versionStore';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { formatDate } from '@/utils/date';

export function ChecklistSelect() {
  const navigate = useNavigate();
  const versions = useVersionStore((state) => state.versions);
  const testingReports = useVersionStore((state) => state.testingReports);

  const eligibleVersions = versions.filter((v) => {
    if (v.status !== 'ready') return false;
    const report = testingReports.find((t) => t.versionId === v.id);
    return report?.signOff !== null;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">上线检查</h2>
        <p className="text-sm text-slate-500">选择要进行上线检查的版本</p>
      </div>

      {eligibleVersions.length > 0 ? (
        <div className="space-y-3">
          {eligibleVersions.map((version) => {
            const report = testingReports.find((t) => t.versionId === version.id);
            return (
              <button
                key={version.id}
                onClick={() => navigate(`/checklist/${version.id}`)}
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
                      {report?.signOff && (
                        <span className="text-green-600">✓ 已签字</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={version.riskLevel} />
                  <StatusBadge status={version.status} />
                  <ArrowRight size={20} className="text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-2">暂无需要上线检查的版本</p>
          <p className="text-sm text-slate-400">请先完成测试准入并签字确认</p>
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          <strong>提示：</strong>只有状态为「待发布」且已完成测试准入签字确认的版本才能进行上线检查。
        </p>
      </div>
    </div>
  );
}