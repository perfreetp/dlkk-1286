import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useEffect } from 'react';
import { useVersionStore } from '@/stores/versionStore';
import { useRequirementStore } from '@/stores/requirementStore';
import { useUserStore } from '@/stores/userStore';

export function Layout() {
  const initVersions = useVersionStore((state) => state.init);
  const initRequirements = useRequirementStore((state) => state.init);
  const initUsers = useUserStore((state) => state.init);

  useEffect(() => {
    initVersions();
    initRequirements();
    initUsers();
  }, [initVersions, initRequirements, initUsers]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}