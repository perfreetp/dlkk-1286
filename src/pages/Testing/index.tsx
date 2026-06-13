import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  PenLine,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { useUserStore } from '@/stores/userStore';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatDateTime } from '@/utils/date';
import type { Defect, Blocker, DefectSeverity, DefectStatus, BlockerStatus } from '@/types';
import { DEFECT_SEVERITY_LABELS, DEFECT_SEVERITY_COLORS } from '@/types';

export function Testing() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const getVersion = useVersionStore((state) => state.getVersion);
  const getTestingReport = useVersionStore((state) => state.getTestingReport);
  const updateTestingReport = useVersionStore((state) => state.updateTestingReport);
  
  const currentUser = useUserStore((state) => state.currentUser);

  const version = id ? getVersion(id) : null;
  const testingReport = id ? getTestingReport(id) : null;

  const [formData, setFormData] = useState({
    totalCases: 0,
    passedCases: 0,
    failedCases: 0,
    defects: [] as Defect[],
    blockers: [] as Blocker[],
    signOff: null as { user: string; time: string; comment: string } | null,
  });

  const [showDefectForm, setShowDefectForm] = useState(false);
  const [showBlockerForm, setShowBlockerForm] = useState(false);
  const [newDefect, setNewDefect] = useState<Partial<Defect>>({
    title: '',
    severity: 'major',
    status: 'open',
    owner: currentUser.name,
  });
  const [newBlocker, setNewBlocker] = useState<Partial<Blocker>>({
    title: '',
    description: '',
    owner: currentUser.name,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'open',
  });
  const [signOffComment, setSignOffComment] = useState('');

  useEffect(() => {
    if (testingReport) {
      setFormData({
        totalCases: testingReport.totalCases,
        passedCases: testingReport.passedCases,
        failedCases: testingReport.failedCases,
        defects: testingReport.defects,
        blockers: testingReport.blockers,
        signOff: testingReport.signOff,
      });
    }
  }, [testingReport]);

  if (!version || !testingReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">版本不存在</p>
      </div>
    );
  }

  const passRate = formData.totalCases > 0
    ? Math.round((formData.passedCases / formData.totalCases) * 100)
    : 0;

  const handleSave = () => {
    updateTestingReport(id!, formData);
  };

  const handleAddDefect = () => {
    if (newDefect.title) {
      const defect: Defect = {
        id: `def-${Date.now()}`,
        title: newDefect.title!,
        severity: newDefect.severity as DefectSeverity,
        status: newDefect.status as DefectStatus,
        owner: newDefect.owner!,
      };
      setFormData((prev) => ({
        ...prev,
        defects: [...prev.defects, defect],
      }));
      setNewDefect({
        title: '',
        severity: 'major',
        status: 'open',
        owner: currentUser.name,
      });
      setShowDefectForm(false);
    }
  };

  const handleRemoveDefect = (defectId: string) => {
    setFormData((prev) => ({
      ...prev,
      defects: prev.defects.filter((d) => d.id !== defectId),
    }));
  };

  const handleAddBlocker = () => {
    if (newBlocker.title) {
      const blocker: Blocker = {
        id: `blk-${Date.now()}`,
        title: newBlocker.title!,
        description: newBlocker.description || '',
        owner: newBlocker.owner!,
        dueDate: newBlocker.dueDate!,
        status: newBlocker.status as BlockerStatus,
      };
      setFormData((prev) => ({
        ...prev,
        blockers: [...prev.blockers, blocker],
      }));
      setNewBlocker({
        title: '',
        description: '',
        owner: currentUser.name,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'open',
      });
      setShowBlockerForm(false);
    }
  };

  const handleRemoveBlocker = (blockerId: string) => {
    setFormData((prev) => ({
      ...prev,
      blockers: prev.blockers.filter((b) => b.id !== blockerId),
    }));
  };

  const handleSignOff = () => {
    if (currentUser.role === 'test' && formData.blockers.length === 0) {
      setFormData((prev) => ({
        ...prev,
        signOff: {
          user: currentUser.name,
          time: new Date().toISOString(),
          comment: signOffComment,
        },
      }));
      updateTestingReport(id!, {
        ...formData,
        signOff: {
          user: currentUser.name,
          time: new Date().toISOString(),
          comment: signOffComment,
        },
      });
    }
  };

  const canSignOff = currentUser.role === 'test' && formData.blockers.length === 0 && passRate >= 95;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">测试准入</h2>
          <span className="text-lg text-slate-500">{version.versionNumber}</span>
          <StatusBadge status={version.status} />
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Save size={18} />
          保存
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">用例总数</p>
          <input
            type="number"
            value={formData.totalCases}
            onChange={(e) => setFormData({ ...formData, totalCases: parseInt(e.target.value) || 0 })}
            className="text-3xl font-bold text-slate-800 w-full bg-transparent focus:outline-none"
          />
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">通过数</p>
          <input
            type="number"
            value={formData.passedCases}
            onChange={(e) => setFormData({ ...formData, passedCases: parseInt(e.target.value) || 0 })}
            className="text-3xl font-bold text-green-600 w-full bg-transparent focus:outline-none"
          />
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">失败数</p>
          <input
            type="number"
            value={formData.failedCases}
            onChange={(e) => setFormData({ ...formData, failedCases: parseInt(e.target.value) || 0 })}
            className="text-3xl font-bold text-red-600 w-full bg-transparent focus:outline-none"
          />
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">通过率</p>
          <div className="flex items-center gap-2">
            <p className={clsx(
              'text-3xl font-bold',
              passRate >= 95 ? 'text-green-600' : passRate >= 80 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {passRate}%
            </p>
            {passRate >= 95 ? (
              <CheckCircle2 size={24} className="text-green-500" />
            ) : passRate >= 80 ? (
              <AlertTriangle size={24} className="text-yellow-500" />
            ) : (
              <XCircle size={24} className="text-red-500" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-medium text-slate-700">遗留缺陷 ({formData.defects.length})</h3>
          <button
            onClick={() => setShowDefectForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Plus size={16} />
            添加缺陷
          </button>
        </div>

        {showDefectForm && (
          <div className="p-4 border-b border-slate-200 bg-orange-50">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">缺陷标题</label>
                <input
                  type="text"
                  value={newDefect.title}
                  onChange={(e) => setNewDefect({ ...newDefect, title: e.target.value })}
                  placeholder="描述缺陷..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">严重程度</label>
                <select
                  value={newDefect.severity}
                  onChange={(e) => setNewDefect({ ...newDefect, severity: e.target.value as DefectSeverity })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                >
                  {Object.entries(DEFECT_SEVERITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAddDefect}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowDefectForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          {formData.defects.length > 0 ? (
            <div className="space-y-2">
              {formData.defects.map((defect) => (
                <div
                  key={defect.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium border',
                        DEFECT_SEVERITY_COLORS[defect.severity]
                      )}
                    >
                      {DEFECT_SEVERITY_LABELS[defect.severity]}
                    </span>
                    <span className="font-medium text-slate-800">{defect.title}</span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs',
                      defect.status === 'open' ? 'bg-red-100 text-red-700' :
                      defect.status === 'fixed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {defect.status === 'open' ? '待修复' : defect.status === 'fixed' ? '已修复' : '不修复'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{defect.owner}</span>
                    <button
                      onClick={() => handleRemoveDefect(defect.id)}
                      className="p-1 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">暂无遗留缺陷</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-medium text-slate-700 flex items-center gap-2">
            阻塞项 ({formData.blockers.length})
            {formData.blockers.length > 0 && (
              <AlertTriangle size={18} className="text-red-500" />
            )}
          </h3>
          <button
            onClick={() => setShowBlockerForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Plus size={16} />
            添加阻塞项
          </button>
        </div>

        {showBlockerForm && (
          <div className="p-4 border-b border-slate-200 bg-red-50">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">阻塞标题</label>
                <input
                  type="text"
                  value={newBlocker.title}
                  onChange={(e) => setNewBlocker({ ...newBlocker, title: e.target.value })}
                  placeholder="描述阻塞问题..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">预计解决日期</label>
                <input
                  type="date"
                  value={newBlocker.dueDate}
                  onChange={(e) => setNewBlocker({ ...newBlocker, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAddBlocker}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowBlockerForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          {formData.blockers.length > 0 ? (
            <div className="space-y-2">
              {formData.blockers.map((blocker) => (
                <div
                  key={blocker.id}
                  className={clsx(
                    'p-4 rounded-lg border',
                    blocker.status === 'open' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800">{blocker.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        blocker.status === 'open' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
                      )}>
                        {blocker.status === 'open' ? '待解决' : '已解决'}
                      </span>
                      <button
                        onClick={() => handleRemoveBlocker(blocker.id)}
                        className="p-1 rounded hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{blocker.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>责任人: {blocker.owner}</span>
                    <span>预计解决: {formatDate(blocker.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">暂无阻塞项</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-medium text-slate-700 flex items-center gap-2">
            <PenLine size={18} />
            签字确认
          </h3>
        </div>

        <div className="p-4">
          {formData.signOff ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-500" />
                  <span className="font-medium text-green-700">已签字确认</span>
                </div>
                <span className="text-sm text-slate-500">{formatDateTime(formData.signOff.time)}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">{formData.signOff.user}</span>
              </div>
              {formData.signOff.comment && (
                <p className="text-sm text-slate-600 bg-white p-2 rounded mt-2">
                  {formData.signOff.comment}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {currentUser.role === 'test' ? (
                <>
                  <div className={clsx(
                    'p-4 rounded-lg border',
                    canSignOff ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                  )}>
                    <p className="text-sm text-slate-600 mb-2">
                      {canSignOff
                        ? '测试通过，可以签字确认发布'
                        : formData.blockers.length > 0
                        ? '存在阻塞项，需先解决阻塞项'
                        : `通过率 ${passRate}%，需达到 95% 才可签字确认`}
                    </p>
                    <textarea
                      value={signOffComment}
                      onChange={(e) => setSignOffComment(e.target.value)}
                      placeholder="填写确认意见..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSignOff}
                    disabled={!canSignOff}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                      canSignOff
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    <PenLine size={18} />
                    签字确认
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  仅测试工程师可签字确认
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/release/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
          返回发布单
        </button>
        {formData.signOff && (
          <button
            onClick={() => navigate(`/checklist/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            进入上线检查
          </button>
        )}
      </div>
    </div>
  );
}