import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle2, XCircle, AlertTriangle, Save, Edit, X } from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { useUserStore } from '@/stores/userStore';
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
  const updateReleaseRecord = useVersionStore((state) => state.updateReleaseRecord);
  const updateVersion = useVersionStore((state) => state.updateVersion);
  const currentUser = useUserStore((state) => state.currentUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<ReleaseResult | 'all'>('all');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState(false);
  const [reviewConclusion, setReviewConclusion] = useState('');
  const [openIssues, setOpenIssues] = useState('');
  const [followUpOwner, setFollowUpOwner] = useState('');

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

  const handleEditReview = () => {
    if (selectedRecord) {
      const parts = selectedRecord.reviewConclusion?.split('\n\n') || [];
      setReviewConclusion(parts[0] || '');
      setOpenIssues(parts[1]?.replace('遗留问题：', '') || '');
      setFollowUpOwner(selectedRecord.followUpOwner || '');
      setEditingReview(true);
    }
  };

  const handleSaveReview = () => {
    if (selectedVersionId) {
      const conclusion = [
        reviewConclusion,
        openIssues ? `遗留问题：${openIssues}` : '',
        followUpOwner ? `跟进人：${followUpOwner}` : '',
      ].filter(Boolean).join('\n\n');

      updateReleaseRecord(selectedVersionId, {
        reviewConclusion: conclusion,
        followUpOwner,
      });
      
      updateVersion(selectedVersionId, {
        reviewInfo: {
          conclusion: reviewConclusion,
          openIssues,
          followUpOwner,
          updatedAt: new Date().toISOString(),
        },
      });
      
      setEditingReview(false);
    }
  };

  const parseReviewConclusion = (conclusion?: string) => {
    if (!conclusion) return { main: '', issues: '', owner: '' };
    const parts = conclusion.split('\n\n');
    return {
      main: parts[0] || '',
      issues: parts[1]?.replace('遗留问题：', '') || '',
      owner: parts[2]?.replace('跟进人：', '') || '',
    };
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
                    onClick={() => {
                      setSelectedVersionId(version.id);
                      setEditingReview(false);
                    }}
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

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-800">复盘信息</h3>
                    {!editingReview && (
                      <button
                        onClick={handleEditReview}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Edit size={14} />
                        编辑
                      </button>
                    )}
                  </div>

                  {editingReview ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">复盘结论</label>
                        <textarea
                          value={reviewConclusion}
                          onChange={(e) => setReviewConclusion(e.target.value)}
                          placeholder="填写复盘总结..."
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">遗留问题</label>
                        <textarea
                          value={openIssues}
                          onChange={(e) => setOpenIssues(e.target.value)}
                          placeholder="填写遗留问题..."
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">跟进人</label>
                        <input
                          type="text"
                          value={followUpOwner}
                          onChange={(e) => setFollowUpOwner(e.target.value)}
                          placeholder="填写跟进负责人..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveReview}
                          className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Save size={16} />
                          保存
                        </button>
                        <button
                          onClick={() => setEditingReview(false)}
                          className="flex items-center gap-1 px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          <X size={16} />
                          取消
                        </button>
                      </div>
                    </div>
                  ) : selectedRecord.reviewConclusion ? (
                    (() => {
                      const parsed = parseReviewConclusion(selectedRecord.reviewConclusion);
                      return (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-slate-500 mb-1">复盘结论</p>
                            <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{parsed.main || '无'}</p>
                          </div>
                          {parsed.issues && (
                            <div>
                              <p className="text-sm text-slate-500 mb-1">遗留问题</p>
                              <p className="text-sm text-slate-700 bg-yellow-50 p-2 rounded">{parsed.issues}</p>
                            </div>
                          )}
                          {parsed.owner && (
                            <div>
                              <p className="text-sm text-slate-500 mb-1">跟进人</p>
                              <p className="text-sm text-slate-700 bg-blue-50 p-2 rounded">{parsed.owner}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">
                      暂无复盘信息，点击编辑添加
                    </p>
                  )}
                </div>

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