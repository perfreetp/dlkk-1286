import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { Timeline } from '@/components/Timeline';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { formatDate, formatDateTime } from '@/utils/date';
import type { ReleaseResult } from '@/types';

export function Records() {
  const navigate = useNavigate();
  const versions = useVersionStore((state) => state.versions);
  const releaseRecords = useVersionStore((state) => state.releaseRecords);
  const getReleaseRecord = useVersionStore((state) => state.getReleaseRecord);

  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<ReleaseResult | 'all'>('all');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const releasedVersions = versions.filter(
    (v) => v.status === 'released' || v.status === 'rolled_back'
  );

  const filteredVersions = releasedVersions.filter((v) => {
    const matchesSearch = v.versionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const record = getReleaseRecord(v.id);
    const matchesResult = resultFilter === 'all' || (record && record.result === resultFilter);
    return matchesSearch && matchesResult;
  });

  const selectedVersion = selectedVersionId
    ? releasedVersions.find((v) => v.id === selectedVersionId)
    : null;
  const selectedRecord = selectedVersionId ? getReleaseRecord(selectedVersionId) : null;

  const resultCounts = {
    all: releasedVersions.length,
    success: releasedVersions.filter((v) => getReleaseRecord(v.id)?.result === 'success').length,
    failed: releasedVersions.filter((v) => getReleaseRecord(v.id)?.result === 'failed').length,
    partial: releasedVersions.filter((v) => getReleaseRecord(v.id)?.result === 'partial').length,
  };

  const ResultIcon = ({ result }: { result: ReleaseResult }) => {
    if (result === 'success') return <CheckCircle2 size={16} className="text-green-500" />;
    if (result === 'failed') return <XCircle size={16} className="text-red-500" />;
    return <AlertTriangle size={16} className="text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">发布记录</h2>
        <span className="text-sm text-slate-500">共 {releasedVersions.length} 条记录</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索版本..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as ReleaseResult | 'all')}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
            >
              <option value="all">全部结果 ({resultCounts.all})</option>
              <option value="success">成功 ({resultCounts.success})</option>
              <option value="failed">失败 ({resultCounts.failed})</option>
              <option value="partial">部分成功 ({resultCounts.partial})</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {(['success', 'failed', 'partial'] as ReleaseResult[]).map((result) => (
            <button
              key={result}
              onClick={() => setResultFilter(result)}
              className={clsx(
                'p-4 rounded-lg border transition-colors text-center',
                resultFilter === result
                  ? result === 'success' ? 'bg-green-50 border-green-300' :
                    result === 'failed' ? 'bg-red-50 border-red-300' :
                    'bg-yellow-50 border-yellow-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <ResultIcon result={result} />
                <p className="text-2xl font-bold text-slate-800">{resultCounts[result]}</p>
              </div>
              <p className="text-sm text-slate-500">
                {result === 'success' ? '发布成功' : result === 'failed' ? '发布失败' : '部分成功'}
              </p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-700 mb-2">版本列表</h3>
            {filteredVersions.length > 0 ? (
              filteredVersions.map((version) => {
                const record = getReleaseRecord(version.id);
                return (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersionId(version.id)}
                    className={clsx(
                      'w-full p-4 rounded-lg border transition-colors text-left',
                      selectedVersionId === version.id
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{version.versionNumber}</span>
                        <span className="text-sm text-slate-500">{version.title}</span>
                      </div>
                      {record && <ResultIcon result={record.result} />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>发布时间: {formatDate(version.actualDate || version.plannedDate)}</span>
                      <RiskBadge level={version.riskLevel} />
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center text-slate-500 py-8">没有找到匹配的记录</p>
            )}
          </div>

          <div>
            {selectedVersion && selectedRecord ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-medium text-slate-800 mb-2">发布详情</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">发布结果</span>
                      <span className={clsx(
                        'px-2 py-1 rounded text-sm font-medium',
                        selectedRecord.result === 'success' ? 'bg-green-100 text-green-700' :
                        selectedRecord.result === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      )}>
                        {selectedRecord.result === 'success' ? '发布成功' :
                         selectedRecord.result === 'failed' ? '发布失败' : '部分成功'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">参与人员</span>
                      <span className="text-sm text-slate-700">
                        {selectedRecord.participants.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">发布时间</span>
                      <span className="text-sm text-slate-700">
                        {formatDateTime(selectedRecord.releasedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-medium text-slate-800 mb-4">发布时间线</h3>
                  <Timeline events={selectedRecord.timeline} />
                </div>

                {selectedRecord.reviewConclusion && (
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h3 className="font-medium text-slate-800 mb-2">复盘结论</h3>
                    <p className="text-sm text-slate-600">{selectedRecord.reviewConclusion}</p>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/release/${selectedVersion.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  <Eye size={18} />
                  查看发布单详情
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 text-center">
                <p className="text-slate-500">请选择一个版本查看发布记录详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}