import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ClipboardCheck,
  CheckSquare,
  Clock,
  AlertTriangle,
  ArrowRight,
  Edit,
  CheckCircle,
  Play,
} from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { useUserStore } from '@/stores/userStore';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { formatDate } from '@/utils/date';
import { USER_ROLE_LABELS } from '@/types';

interface TodoItem {
  id: string;
  title: string;
  versionNumber?: string;
  versionId?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  rejectedReason?: string;
}

export function Workbench() {
  const navigate = useNavigate();
  const versions = useVersionStore((state) => state.versions);
  const testingReports = useVersionStore((state) => state.testingReports);
  const currentUser = useUserStore((state) => state.currentUser);

  const getTodoItems = (): TodoItem[] => {
    const items: TodoItem[] = [];
    const role = currentUser.role;

    if (role === 'product') {
      versions
        .filter((v) => v.status === 'pending' || v.rejectedReason)
        .forEach((v) => {
          items.push({
            id: v.id,
            title: v.rejectedReason ? '版本被驳回，需修改后重新提交' : '待提交的版本',
            versionNumber: v.versionNumber,
            versionId: v.id,
            description: v.title,
            priority: 'high',
            type: 'version',
          });
        });
      versions
        .filter((v) => v.status === 'released' && v.requirementIds.length > 0)
        .forEach((v) => {
          const incompleteReqs = v.requirementIds.length;
          if (incompleteReqs > 0) {
            items.push({
              id: `${v.id}-reqs`,
              title: '有待处理需求',
              versionNumber: v.versionNumber,
              versionId: v.id,
              description: `${incompleteReqs} 个需求待跟进`,
              priority: 'medium',
              type: 'requirement',
            });
          }
        });
    }

    if (role === 'admin') {
      versions
        .filter((v) => v.status === 'pending')
        .forEach((v) => {
          items.push({
            id: v.id,
            title: '待审批版本',
            versionNumber: v.versionNumber,
            versionId: v.id,
            description: v.title,
            priority: v.riskLevel === 'high' ? 'high' : 'medium',
            type: 'approval',
          });
        });
    }

    if (role === 'test') {
      versions
        .filter((v) => v.status === 'approved' || v.status === 'testing')
        .forEach((v) => {
          const report = testingReports.find((t) => t.versionId === v.id);
          if (report && !report.signOff) {
            items.push({
              id: v.id,
              title: '待签字确认',
              versionNumber: v.versionNumber,
              versionId: v.id,
              description: `通过率 ${report.totalCases > 0 ? Math.round((report.passedCases / report.totalCases) * 100) : 0}%`,
              priority: 'high',
              type: 'signoff',
            });
          }
        });
      versions
        .filter((v) => v.status === 'approved')
        .forEach((v) => {
          const hasReport = testingReports.some((t) => t.versionId === v.id);
          if (!hasReport) {
            items.push({
              id: v.id,
              title: '待创建测试报告',
              versionNumber: v.versionNumber,
              versionId: v.id,
              description: v.title,
              priority: 'high',
              type: 'testing',
            });
          }
        });
    }

    if (role === 'dev') {
      versions
        .filter((v) => v.status === 'ready')
        .forEach((v) => {
          const report = testingReports.find((t) => t.versionId === v.id);
          if (report?.signOff) {
            items.push({
              id: v.id,
              title: '待执行发布',
              versionNumber: v.versionNumber,
              versionId: v.id,
              description: v.title,
              priority: 'high',
              type: 'release',
            });
          }
        });
    }

    return items.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const todoItems = getTodoItems();
  const highPriorityItems = todoItems.filter((i) => i.priority === 'high');
  const otherItems = todoItems.filter((i) => i.priority !== 'high');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'version':
        return <Edit size={18} className="text-orange-500" />;
      case 'approval':
        return <ClipboardCheck size={18} className="text-blue-500" />;
      case 'signoff':
        return <CheckSquare size={18} className="text-green-500" />;
      case 'testing':
        return <FileText size={18} className="text-purple-500" />;
      case 'release':
        return <Play size={18} className="text-emerald-500" />;
      case 'requirement':
        return <Clock size={18} className="text-yellow-500" />;
      default:
        return <FileText size={18} className="text-slate-500" />;
    }
  };

  const getActionPath = (item: TodoItem) => {
    switch (item.type) {
      case 'version':
      case 'approval':
      case 'requirement':
        return `/release/${item.versionId}`;
      case 'testing':
      case 'signoff':
        return `/testing/${item.versionId}`;
      case 'release':
        return `/checklist/${item.versionId}`;
      default:
        return `/release/${item.versionId}`;
    }
  };

  const getActionLabel = (item: TodoItem) => {
    switch (item.type) {
      case 'version':
        return item.rejectedReason ? '修改版本' : '完善版本';
      case 'approval':
        return '去审批';
      case 'signoff':
        return '去签字';
      case 'testing':
        return '填写报告';
      case 'release':
        return '执行发布';
      case 'requirement':
        return '查看需求';
      default:
        return '查看';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={28} className="text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">工作台</h2>
            <p className="text-sm text-slate-500">{USER_ROLE_LABELS[currentUser.role]} - {currentUser.name}</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-orange-100 rounded-lg">
          <span className="text-lg font-bold text-orange-600">{todoItems.length}</span>
          <span className="text-sm text-orange-500 ml-1">项待办</span>
        </div>
      </div>

      {todoItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">太棒了！</p>
          <p className="text-slate-500">当前没有待处理的任务</p>
        </div>
      ) : (
        <>
          {highPriorityItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h3 className="font-medium text-slate-800">紧急待办</h3>
              </div>
              {highPriorityItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(getActionPath(item))}
                  className="w-full bg-white rounded-lg border border-red-200 p-4 hover:border-red-400 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          {item.versionNumber && (
                            <span className="font-bold text-slate-800">{item.versionNumber}</span>
                          )}
                          <span className="text-slate-700">{item.title}</span>
                        </div>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                        紧急
                      </span>
                      <span className="flex items-center gap-1 text-orange-600 text-sm">
                        {getActionLabel(item)}
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {otherItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-slate-700">其他待办</h3>
              <div className="grid grid-cols-2 gap-4">
                {otherItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(getActionPath(item))}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:border-orange-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      {getTypeIcon(item.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.versionNumber && (
                            <span className="font-bold text-slate-800">{item.versionNumber}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className={clsx(
                        'px-2 py-0.5 text-xs rounded-full font-medium',
                        item.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-slate-100 text-slate-600'
                      )}>
                        {item.priority === 'medium' ? '一般' : '低'}
                      </span>
                      <span className="flex items-center gap-1 text-orange-600 text-xs">
                        {getActionLabel(item)}
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          <strong>提示：</strong>工作台会根据您的角色显示对应的待办事项，点击可直接跳转到处理页面。
        </p>
      </div>
    </div>
  );
}