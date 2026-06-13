import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, CheckCircle2, Play, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useVersionStore } from '@/stores/versionStore';
import { useUserStore } from '@/stores/userStore';
import { StatusBadge } from '@/components/StatusBadge';
import { ChecklistGroup } from '@/components/ChecklistGroup';
import type { ChecklistItem, ChecklistCategory, TimelineEvent } from '@/types';
import { CHECKLIST_CATEGORY_LABELS } from '@/types';
import { generateId } from '@/utils/date';

export function ChecklistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const getVersion = useVersionStore((state) => state.getVersion);
  const getChecklist = useVersionStore((state) => state.getChecklist);
  const updateChecklist = useVersionStore((state) => state.updateChecklist);
  const updateStatus = useVersionStore((state) => state.updateStatus);
  const updateVersion = useVersionStore((state) => state.updateVersion);
  const addReleaseRecord = useVersionStore((state) => state.addReleaseRecord);
  const getTestingReport = useVersionStore((state) => state.getTestingReport);
  
  const currentUser = useUserStore((state) => state.currentUser);

  const version = id ? getVersion(id) : null;
  const checklist = id ? getChecklist(id) : null;
  const testingReport = id ? getTestingReport(id) : null;

  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (checklist) {
      setItems(checklist.items);
    }
  }, [checklist]);

  if (!version || !checklist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">版本不存在</p>
      </div>
    );
  }

  const categories: ChecklistCategory[] = ['config', 'notification', 'backup', 'grayscale'];
  
  const getItemsByCategory = (category: ChecklistCategory) => {
    return items.filter((item) => item.category === category);
  };

  const completedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allCompleted = progress === 100;

  const handleItemChange = (itemId: string, checked: boolean, note?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked, note: note || item.note } : item
      )
    );
  };

  const handleSave = () => {
    updateChecklist(id!, items);
  };

  const handleRelease = () => {
    if (allCompleted && (currentUser.role === 'dev' || currentUser.role === 'admin')) {
      const now = new Date().toISOString();
      
      const timeline: TimelineEvent[] = [
        {
          id: generateId(),
          time: now,
          title: '开始发布',
          description: `开始部署版本 ${version.versionNumber}`,
          user: currentUser.name,
        },
        {
          id: generateId(),
          time: now,
          title: '部署完成',
          description: '所有服务部署完成',
          user: currentUser.name,
        },
        {
          id: generateId(),
          time: now,
          title: '验证通过',
          description: '功能验证通过',
          user: testingReport?.signOff?.user || currentUser.name,
        },
        {
          id: generateId(),
          time: now,
          title: '发布完成',
          description: '发布成功，通知相关人员',
          user: currentUser.name,
        },
      ];

      const participants = [
        version.owner,
        testingReport?.signOff?.user || '',
        currentUser.name,
      ].filter(Boolean);

      addReleaseRecord({
        versionId: id!,
        timeline,
        participants,
        result: 'success',
        reviewConclusion: '',
        releasedAt: now,
      });

      updateVersion(id!, {
        status: 'released',
        actualDate: now.split('T')[0],
      });

      navigate(`/records`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">上线检查</h2>
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

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500">检查进度</p>
            <p className="text-2xl font-bold text-slate-800">
              {completedCount} / {totalCount} 已完成
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full transition-all duration-300',
                  allCompleted ? 'bg-green-500' : progress > 50 ? 'bg-orange-400' : 'bg-slate-400'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={clsx(
              'text-lg font-bold',
              allCompleted ? 'text-green-600' : 'text-slate-600'
            )}>
              {progress}%
            </span>
          </div>
        </div>

        {allCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-green-500" />
            <div>
              <p className="font-medium text-green-700">所有检查项已完成</p>
              <p className="text-sm text-green-600">可以进行发布操作</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <ChecklistGroup
            key={category}
            category={category}
            items={getItemsByCategory(category)}
            onItemChange={handleItemChange}
            readOnly={version.status === 'released'}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/release/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
          <ArrowLeft size={18} />
          返回发布单
        </button>
        
        {(currentUser.role === 'dev' || currentUser.role === 'admin') && version.status === 'ready' && (
          <button
            onClick={handleRelease}
            disabled={!allCompleted}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              allCompleted
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            <Play size={18} />
            执行发布
          </button>
        )}
      </div>
    </div>
  );
}