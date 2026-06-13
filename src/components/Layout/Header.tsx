import { Bell, Search, User } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {title && <h2 className="text-xl font-semibold text-slate-800">{title}</h2>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜索版本..."
            className="pl-10 pr-4 py-2 w-48 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20"
          />
        </div>

        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full bg-slate-200"
          />
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-slate-700">{currentUser.name}</span>
            <User size={14} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}