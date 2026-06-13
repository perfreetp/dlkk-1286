import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Link, ExternalLink, X, Save, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useRequirementStore } from '@/stores/requirementStore';
import { useVersionStore } from '@/stores/versionStore';
import { useUserStore } from '@/stores/userStore';
import { PriorityBadge } from '@/components/PriorityBadge';
import { formatDate } from '@/utils/date';
import type { Requirement, RequirementStatus, Priority } from '@/types';
import { REQUIREMENT_STATUS_LABELS, PRIORITY_LABELS } from '@/types';

export function Requirements() {
  const navigate = useNavigate();
  const requirements = useRequirementStore((state) => state.requirements);
  const versions = useVersionStore((state) => state.versions);
  const createRequirement = useRequirementStore((state) => state.createRequirement);
  const currentUser = useUserStore((state) => state.currentUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState<string | null>(null);
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    description: '',
    priority: 'p2' as Priority,
    owner: currentUser.name,
  });

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getVersionForRequirement = (reqId: string) => {
    return versions.find((v) => v.requirementIds.includes(reqId) && v.status !== 'cancelled');
  };

  const statusCounts = {
    all: requirements.length,
    pending: requirements.filter((r) => r.status === 'pending').length,
    developing: requirements.filter((r) => r.status === 'developing').length,
    testing: requirements.filter((r) => r.status === 'testing').length,
    done: requirements.filter((r) => r.status === 'done').length,
  };

  const handleCreateRequirement = () => {
    if (newRequirement.title) {
      createRequirement({
        title: newRequirement.title,
        description: newRequirement.description,
        priority: newRequirement.priority,
        owner: newRequirement.owner,
        status: 'pending',
      });
      setNewRequirement({
        title: '',
        description: '',
        priority: 'p2',
        owner: currentUser.name,
      });
      setShowCreateForm(false);
    }
  };

  const linkToVersion = (reqId: string, versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version && !version.requirementIds.includes(reqId)) {
      useVersionStore.getState().updateVersion(versionId, {
        requirementIds: [...version.requirementIds, reqId],
      });
    }
    setShowLinkForm(null);
  };

  const unlinkFromVersion = (reqId: string) => {
    const version = versions.find((v) => v.requirementIds.includes(reqId));
    if (version) {
      useVersionStore.getState().updateVersion(version.id, {
        requirementIds: version.requirementIds.filter((id) => id !== reqId),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">需求清单</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">共 {requirements.length} 条需求</span>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            新建需求
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg border border-orange-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-800">新建需求</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">需求标题</label>
              <input
                type="text"
                value={newRequirement.title}
                onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                placeholder="输入需求标题..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">需求描述</label>
              <textarea
                value={newRequirement.description}
                onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                placeholder="详细描述需求内容..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                <select
                  value={newRequirement.priority}
                  onChange={(e) => setNewRequirement({ ...newRequirement, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">负责人</label>
                <input
                  type="text"
                  value={newRequirement.owner}
                  onChange={(e) => setNewRequirement({ ...newRequirement, owner: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button
                onClick={handleCreateRequirement}
                disabled={!newRequirement.title}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  newRequirement.title
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                <Save size={18} />
                保存
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkForm && (
        <div className="bg-white rounded-lg border border-blue-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-800">关联到版本</h3>
            <button
              onClick={() => setShowLinkForm(null)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            选择要关联到的未发布版本：
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {versions
              .filter((v) => v.status !== 'released' && v.status !== 'rolled_back' && v.status !== 'cancelled')
              .map((version) => (
                <button
                  key={version.id}
                  onClick={() => linkToVersion(showLinkForm, version.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-slate-800">{version.versionNumber}</p>
                    <p className="text-xs text-slate-500">{version.title}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-400" />
                </button>
              ))}
          </div>

          {versions.filter((v) => v.status !== 'released' && v.status !== 'rolled_back' && v.status !== 'cancelled').length === 0 && (
            <p className="text-center text-slate-500 py-4">暂无可关联的版本</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索需求..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequirementStatus | 'all')}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
            >
              <option value="all">全部状态 ({statusCounts.all})</option>
              <option value="pending">待处理 ({statusCounts.pending})</option>
              <option value="developing">开发中 ({statusCounts.developing})</option>
              <option value="testing">测试中 ({statusCounts.testing})</option>
              <option value="done">已完成 ({statusCounts.done})</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
            >
              <option value="all">全部优先级</option>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {(['pending', 'developing', 'testing', 'done'] as RequirementStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                'p-4 rounded-lg border transition-colors text-center',
                statusFilter === status
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              )}
            >
              <p className="text-2xl font-bold text-slate-800">{statusCounts[status]}</p>
              <p className="text-sm text-slate-500">{REQUIREMENT_STATUS_LABELS[status]}</p>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">需求ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">优先级</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">负责人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">关联版本</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((req) => {
                const linkedVersion = getVersionForRequirement(req.id);
                return (
                  <tr
                    key={req.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-slate-600">{req.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{req.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">{req.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          req.status === 'done' ? 'bg-green-100 text-green-700' :
                          req.status === 'testing' ? 'bg-purple-100 text-purple-700' :
                          req.status === 'developing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        )}
                      >
                        {REQUIREMENT_STATUS_LABELS[req.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{req.owner}</td>
                    <td className="px-4 py-3">
                      {linkedVersion ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/release/${linkedVersion.id}`)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Link size={12} />
                            {linkedVersion.versionNumber}
                            <ExternalLink size={12} />
                          </button>
                          <button
                            onClick={() => unlinkFromVersion(req.id)}
                            className="p-1 rounded hover:bg-red-100 transition-colors"
                            title="取消关联"
                          >
                            <X size={14} className="text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowLinkForm(req.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                        >
                          <Plus size={12} />
                          关联版本
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(req.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRequirements.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">没有找到匹配的需求</p>
          </div>
        )}
      </div>
    </div>
  );
}