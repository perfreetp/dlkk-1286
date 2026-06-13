import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  FileText,
  ListTodo,
  ClipboardCheck,
  CheckSquare,
  History,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useUserStore } from '@/stores/userStore';
import { USER_ROLE_LABELS } from '@/types';

const navItems = [
  { path: '/dashboard', label: '流程总览', icon: BarChart3 },
  { path: '/calendar', label: '版本日历', icon: Calendar },
  { path: '/release', label: '发布单', icon: FileText },
  { path: '/requirements', label: '需求清单', icon: ListTodo },
  { path: '/testing', label: '测试准入', icon: ClipboardCheck },
  { path: '/checklist', label: '上线检查', icon: CheckSquare },
  { path: '/records', label: '发布记录', icon: History },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const users = useUserStore((state) => state.users);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

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
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">当前用户</p>
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="p-1 rounded hover:bg-slate-700 transition-colors"
                title="切换角色"
              >
                <Users size={14} className="text-orange-400" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full bg-slate-200"
              />
              <div>
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-orange-400">{USER_ROLE_LABELS[currentUser.role]}</p>
              </div>
            </div>

            {showRoleSelector && (
              <div className="mt-3 pt-3 border-t border-slate-700 space-y-1">
                <p className="text-xs text-slate-500 mb-2">切换角色</p>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setShowRoleSelector(false);
                    }}
                    className={clsx(
                      'w-full flex items-center gap-2 p-2 rounded transition-colors',
                      currentUser.id === user.id
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'hover:bg-slate-700 text-slate-300'
                    )}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full bg-slate-200"
                    />
                    <span className="text-sm">{user.name}</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {USER_ROLE_LABELS[user.role]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}