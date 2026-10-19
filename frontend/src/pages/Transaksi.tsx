import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search, ReceiptText, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../lib/api';
import { formatRupiah, formatTanggal, formatJam } from '../lib/format';
import MethodBadge from '../components/ui/MethodBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ReceiptView from '../components/receipt/ReceiptView';
import EmptyState from '../components/ui/EmptyState';
import type { Order, Paginated, PaymentMethod } from '../types';

type Filter = 'all' | PaymentMethod;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'tunai', label: 'Tunai' },
  { id: 'qris', label: 'QRIS' },
  { id: 'kartu', label: 'Kartu' },
];

export default function Transaksi() {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ['orders', { filter, search, page }],
    queryFn: () =>
      api<Paginated<Order>>('/orders', {
        params: { method: filter === 'all' ? undefined : filter, search, page },
      }),
    placeholderData: keepPreviousData,
  });

  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;

  const omzet = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const selectedOrder = orders.find(o => o.order_no === selected) ?? null;

  return (
    <div>
      {/* Ringkasan + filter */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-2.5">
            <p className="text-xs font-semibold text-gray-400">Omzet (halaman ini)</p>
            <p className="text-sm font-bold text-primary-600">{formatRupiah(omzet)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-2.5">
            <p className="text-xs font-semibold text-gray-400">Total Transaksi</p>
            <p className="text-sm font-bold text-gray-800">{meta?.total ?? 0}</p>
          </div>
        </div>
        <div className="relative lg:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari no. order atau kasir..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setPage(1);
            }}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.id
                ? 'bg-primary-600 text-white'
                : 'border border-gray-100 bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-3 font-semibold">No. Order</th>
                <th className="px-5 py-3 font-semibold">Waktu</th>
                <th className="px-5 py-3 font-semibold">Kasir</th>
                <th className="px-5 py-3 font-semibold">Metode</th>
                <th className="px-5 py-3 font-semibold">Item</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o.order_no)}
                  className="cursor-pointer transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-5 py-3 font-semibold text-primary-600">{o.order_no}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {formatTanggal(o.datetime)}
                    <span className="text-gray-400"> • {formatJam(o.datetime)}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{o.cashier ?? '-'}</td>
                  <td className="px-5 py-3">
                    <MethodBadge method={o.method} />
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {o.items.reduce((s, i) => s + i.qty, 0)} item
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-800">{formatRupiah(o.total)}</td>
                  <td className="px-5 py-3 text-right">
                    <ChevronRight size={16} className="ml-auto text-gray-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ordersQuery.isLoading && (
          <div className="flex justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
          </div>
        )}
        {!ordersQuery.isLoading && orders.length === 0 && (
          <EmptyState
            icon={ReceiptText}
            title="Tidak ada transaksi"
            description="Belum ada transaksi yang cocok dengan filter ini."
          />
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-400">
            Halaman {meta.current_page} dari {meta.last_page}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage(p => p + 1)}
            >
              Berikutnya <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Detail struk */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelected(null)}
        title={selectedOrder ? `Detail ${selectedOrder.order_no}` : 'Detail Transaksi'}
        size="sm"
      >
        {selectedOrder && (
          <div className="bg-gray-50 p-4">
            <ReceiptView order={selectedOrder} />
          </div>
        )}
      </Modal>
    </div>
  );
}
