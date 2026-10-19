import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  Coins,
  Receipt,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import api from '../lib/api';
import { formatRupiah, formatTanggalJam } from '../lib/format';
import MethodBadge from '../components/ui/MethodBadge';
import EmptyState from '../components/ui/EmptyState';
import type { DashboardData } from '../types';
import type { LucideIcon } from 'lucide-react';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  iconColor?: string;
  iconBg?: string;
}) {
  if (accent) {
    return (
      <div className="rounded-2xl bg-linear-to-br from-primary-500 to-primary-700 p-5 text-white shadow-md shadow-primary-600/20">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/80">{label}</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Icon size={18} />
          </div>
        </div>
        <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-white/70">{sub}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<DashboardData>('/dashboard'),
  });

  const data = dashboardQuery.data;
  const today = data?.today;

  return (
    <div className="space-y-5">
      {dashboardQuery.isLoading && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
        </div>
      )}

      {data && today && (
        <>
          {/* Kartu statistik */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Wallet}
              label="Penjualan Hari Ini"
              value={formatRupiah(today.revenue)}
              sub={`${today.transactions} transaksi`}
              accent
            />
            <StatCard
              icon={ShoppingBag}
              label="Item Terjual"
              value={`${today.items_sold}`}
              sub="hari ini"
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <StatCard
              icon={Coins}
              label="Rata-rata / Transaksi"
              value={formatRupiah(today.average)}
              sub="hari ini"
              iconColor="text-sky-600"
              iconBg="bg-sky-50"
            />
            <StatCard
              icon={TrendingUp}
              label="Omzet 7 Hari"
              value={formatRupiah(today.revenue_week)}
              sub="7 hari terakhir"
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
            />
          </div>

          {/* Grafik + produk terlaris */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Penjualan 7 Hari Terakhir</h2>
                  <p className="text-xs text-gray-400">Total omzet per hari</p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                  {formatRupiah(data.week.reduce((s, d) => s + d.total, 0))}
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.week} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}rb` : `${v}`)}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(249, 115, 22, 0.06)' }}
                      formatter={value => [formatRupiah(Number(value)), 'Omzet']}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #f3f4f6',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="total" fill="#f97316" radius={[8, 8, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="font-bold text-gray-900">Produk Terlaris</h2>
              <p className="text-xs text-gray-400">Berdasarkan jumlah terjual</p>
              <div className="mt-4 space-y-4">
                {data.top_products.map((p, i) => (
                  <div key={`${p.product_id ?? p.name}`}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            i === 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <p className="truncate font-semibold text-gray-800">{p.name}</p>
                      </div>
                      <span className="ml-2 shrink-0 text-xs text-gray-400">
                        {p.qty} • {formatRupiah(p.revenue)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{
                          width: `${Math.max(6, Math.round((p.qty / (data.top_products[0]?.qty || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {data.top_products.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">Belum ada data.</p>
                )}
              </div>
            </div>
          </div>

          {/* Transaksi terakhir */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-primary-600" />
                <h2 className="font-bold text-gray-900">Transaksi Terakhir</h2>
              </div>
              <Link
                to="/transaksi"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Lihat Semua <ArrowUpRight size={14} />
              </Link>
            </div>
            {data.recent_orders.length === 0 ? (
              <EmptyState icon={ReceiptText} title="Belum ada transaksi" />
            ) : (
              <div className="space-y-1">
                {data.recent_orders.map(o => (
                  <div
                    key={o.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <ReceiptText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">{o.order_no}</p>
                      <p className="truncate text-xs text-gray-400">
                        {formatTanggalJam(o.datetime)} • {o.cashier ?? '-'}
                      </p>
                    </div>
                    <MethodBadge method={o.method} />
                    <p className="w-24 shrink-0 text-right text-sm font-bold text-gray-800">
                      {formatRupiah(o.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
