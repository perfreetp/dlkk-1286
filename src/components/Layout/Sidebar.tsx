import { NavLink } from 'react-router-dom';
import {
  Calendar,
  FileText,
  ListTodo,
  ClipboardCheck,
  CheckSquare,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const navItems = [
  { path: '/calendar', label: '版本日历', icon: Calendar },
  { path: '/release', label: '发布单', icon: FileText },
  { path: '/requirements', label: '需求清单', icon: ListTodo },
  { path: '/testing', label: '测试准入', icon: ClipboardCheck },
  { path: '/checklist', label: '上线检查', icon: CheckSquare },
  { path: '/records', label: '发布记录', icon: History },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <h1 className="text-lg font-bold text-orange-400">发布管理平台</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-slate-700 hover:text-orange-400',
                isActive
                  ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-400'
                  : 'text-slate-300'
              )
            }
          >
            <item.icon size={20} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-400">当前用户</p>
            <p className="text-sm font-medium text-white mt-1">陈发布</p>
            <p className="text-xs text-slate-500">发布管理员</p>
          </div>
        </div>
      )}
    </aside>
  );
}