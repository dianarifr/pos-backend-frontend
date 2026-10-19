import { useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  ScanBarcode,
  Store,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/', label: 'Kasir', icon: ScanBarcode },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/produk', label: 'Produk', icon: Package },
  { to: '/transaksi', label: 'Transaksi', icon: ReceiptText },
];

const PAGE_INFO: Record<string, { title: string; desc: string }> = {
  '/': { title: 'Kasir', desc: 'Buat transaksi baru' },
  '/dashboard': { title: 'Dashboard', desc: 'Ringkasan performa toko' },
  '/produk': { title: 'Produk', desc: 'Kelola produk & stok' },
  '/transaksi': { title: 'Transaksi', desc: 'Riwayat transaksi' },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { pathname } = useLocation();
  const info = PAGE_INFO[pathname] ?? { title: 'Kasir', desc: '' };
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const initials = (user?.name ?? '')
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-dvh bg-gray-50">
      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-600/30">
              <Store size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight text-gray-900">POS Fullai</p>
              <p className="text-[11px] font-medium text-gray-400">Sistem Kasir Modern</p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              <n.icon size={18} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400">{user.is_admin ? 'Admin' : 'Kasir'}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-300 transition-colors hover:text-rose-500"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{info.title}</h1>
              <p className="hidden text-xs text-gray-400 sm:block">{info.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 md:inline-flex">
              <CalendarDays size={14} />
              {todayLabel}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400">{user.is_admin ? 'Admin' : 'Kasir'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
