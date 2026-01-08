import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Newspaper,
  PieChart,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Loader2,
  MousePointer2
} from 'lucide-react';

import { authApi, AdminUser, ApiError } from '../../services/api';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.me();
        setUser(response.user);
      } catch (err) {
        // Not authenticated, redirect to login
        navigate('/adminauth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics?type=visits' },
    { label: 'Notícias', icon: Newspaper, path: '/admin/news' },
    { label: 'Métricas Notícias', icon: PieChart, path: '/admin/news-metrics' },
    { label: 'Métricas Interações', icon: MousePointer2, path: '/admin/interaction-metrics' },
  ];

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors, still redirect
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Overlay (Mobile) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-corporate-primary text-white rounded-full shadow-2xl"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40 bg-slate-900 text-slate-400 transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden border-r border-slate-800
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="w-8 h-8 bg-corporate-primary rounded flex items-center justify-center text-white font-bold">MP</div>
              <span className="text-white font-bold text-sm tracking-widest uppercase">Admin</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-white transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} className="hidden lg:block" />}
            </button>
          </div>

          <nav className="flex-grow px-4 mt-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path.split('?')[0];
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-lg transition-all group
                    ${isActive ? 'bg-corporate-primary text-white' : 'hover:bg-slate-800 hover:text-slate-200'}
                  `}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-corporate-primary'} />
                  {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-slate-800 font-bold text-lg">
            {menuItems.find(i => location.pathname === i.path.split('?')[0])?.label || 'Painel de Controlo'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">Administrador</p>
              <p className="text-[10px] text-slate-400">{user?.email || 'admin@mptrading.com'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <User size={20} className="text-slate-400" />
            </div>
          </div>
        </header>

        <div className="p-8 flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;