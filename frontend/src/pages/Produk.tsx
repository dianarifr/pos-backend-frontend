import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2, TriangleAlert } from 'lucide-react';
import api, { ApiError } from '../lib/api';
import { formatRupiah } from '../lib/format';
import Badge, { type BadgeColor } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import type { Category, Product, ProductFormPayload } from '../types';

const CAT_BADGE: Record<string, BadgeColor> = {
  Kopi: 'orange',
  Minuman: 'blue',
  Makanan: 'amber',
  Snack: 'red',
  Lainnya: 'violet',
};

const COLOR_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'bg-orange-100', label: '🟠 Oranye' },
  { value: 'bg-amber-100', label: '🟡 Kuning' },
  { value: 'bg-sky-100', label: '🔵 Biru Muda' },
  { value: 'bg-blue-100', label: '🔷 Biru' },
  { value: 'bg-rose-100', label: '🌸 Merah Muda' },
  { value: 'bg-red-100', label: '🔴 Merah' },
  { value: 'bg-lime-100', label: '🟢 Hijau' },
  { value: 'bg-violet-100', label: '🟣 Ungu' },
  { value: 'bg-gray-100', label: '⚪ Abu-abu' },
];

const inputCls =
  'h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100';
const labelCls = 'text-xs font-semibold text-gray-500';

interface FormState {
  name: string;
  category_id: string;
  price: string;
  stock: string;
  emoji: string;
  color: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  name: '',
  category_id: '',
  price: '',
  stock: '',
  emoji: '',
  color: 'bg-orange-100',
  is_active: true,
};

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge color="red">Habis</Badge>;
  if (stock <= 5) return <Badge color="amber">{stock} • Menipis</Badge>;
  return <Badge color="green">{stock}</Badge>;
}

export default function Produk() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products', { all: true }],
    queryFn: () => api<{ data: Product[] }>('/products', { params: { all: true } }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<{ data: Category[] }>('/categories'),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['products'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: ProductFormPayload }) =>
      api<{ data: Product }>(id === null ? '/products' : `/products/${id}`, {
        method: id === null ? 'POST' : 'PUT',
        body: payload,
      }),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
    onError: err => {
      setFormError(err instanceof ApiError ? err.message : 'Gagal menyimpan produk.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
    },
    onError: err => {
      setFormError(err instanceof ApiError ? err.message : 'Gagal menghapus produk.');
    },
  });

  useEffect(() => {
    if (formOpen) {
      setFormError(null);
      setForm(
        editing
          ? {
              name: editing.name,
              category_id: String(editing.category.id),
              price: String(editing.price),
              stock: String(editing.stock),
              emoji: editing.emoji,
              color: editing.color,
              is_active: editing.is_active,
            }
          : emptyForm,
      );
    }
  }, [formOpen, editing]);

  const products = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];

  const filtered = useMemo(
    () =>
      products.filter(
        p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const submit = () => {
    if (!form.name.trim() || !form.category_id || Number(form.price) <= 0) {
      setFormError('Lengkapi nama, kategori, dan harga dengan benar.');
      return;
    }
    setFormError(null);
    saveMutation.mutate({
      id: editing?.id ?? null,
      payload: {
        name: form.name.trim(),
        category_id: Number(form.category_id),
        price: Number(form.price),
        stock: Math.max(0, Number(form.stock) || 0),
        emoji: form.emoji.trim() || undefined,
        color: form.color,
        is_active: form.is_active,
      },
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Tambah Produk
        </Button>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Produk</th>
                <th className="px-5 py-3 font-semibold">Kategori</th>
                <th className="px-5 py-3 font-semibold">Harga</th>
                <th className="px-5 py-3 font-semibold">Stok</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${p.color}`}
                      >
                        {p.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={CAT_BADGE[p.category.name] ?? 'gray'}>{p.category.name}</Badge>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{formatRupiah(p.price)}</td>
                  <td className="px-5 py-3">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-5 py-3">
                    {p.is_active ? (
                      <Badge color="green">Aktif</Badge>
                    ) : (
                      <Badge color="gray">Nonaktif</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(p)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productsQuery.isLoading && (
          <div className="flex justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
          </div>
        )}
        {!productsQuery.isLoading && filtered.length === 0 && (
          <EmptyState
            icon={Search}
            title="Produk tidak ditemukan"
            description="Coba kata kunci lain."
          />
        )}
      </div>

      {/* Modal tambah/edit */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Produk' : 'Tambah Produk'}
        size="md"
      >
        <div className="space-y-4 p-5">
          {formError && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {formError}
            </div>
          )}
          <div>
            <label className={labelCls}>Nama Produk</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="cth. Kopi Susu Gula Aren"
              className={`mt-1.5 ${inputCls}`}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Kategori</label>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className={`mt-1.5 ${inputCls}`}
              >
                <option value="">Pilih kategori...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Emoji</label>
              <input
                value={form.emoji}
                onChange={e => setForm({ ...form, emoji: e.target.value })}
                placeholder="🍽️"
                className={`mt-1.5 ${inputCls}`}
              />
            </div>
            <div>
              <label className={labelCls}>Harga (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className={`mt-1.5 ${inputCls}`}
              />
            </div>
            <div>
              <label className={labelCls}>Stok</label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className={`mt-1.5 ${inputCls}`}
              />
            </div>
            <div>
              <label className={labelCls}>Warna Kartu</label>
              <select
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className={`mt-1.5 ${inputCls}`}
              >
                {COLOR_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary-600"
                />
                Aktif di kasir
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 p-4">
          <Button variant="outline" onClick={() => setFormOpen(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah'}
          </Button>
        </div>
      </Modal>

      {/* Modal hapus */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Hapus Produk" size="sm">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <TriangleAlert size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Yakin ingin menghapus "{deleting?.name}"?
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Produk yang dihapus tidak akan muncul lagi di katalog kasir.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 p-4">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deleting && deleteMutation.mutate(deleting.id)}
          >
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
