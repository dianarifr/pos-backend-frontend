import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PackageOpen, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api, { ApiError } from '../lib/api';
import { TAX_RATE } from '../lib/constants';
import ProductCard from '../components/kasir/ProductCard';
import CartPanel from '../components/kasir/CartPanel';
import PaymentModal from '../components/kasir/PaymentModal';
import ReceiptModal from '../components/kasir/ReceiptModal';
import EmptyState from '../components/ui/EmptyState';
import type { Category, CheckoutPayload, Order, Product } from '../types';

export default function Kasir() {
  const queryClient = useQueryClient();
  const { items, addItem, clear, discount, subtotal } = useCart();

  const [category, setCategory] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<{ data: Category[] }>('/categories'),
  });

  const productsQuery = useQuery({
    queryKey: ['products', { category, search }],
    queryFn: () =>
      api<{ data: Product[] }>('/products', {
        params: { category: category === 'all' ? undefined : category, search },
      }),
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload: CheckoutPayload) =>
      api<{ data: Order }>('/orders', {
        method: 'POST',
        body: {
          items: payload.items.map(i => ({ product_id: i.product.id, qty: i.qty })),
          discount: payload.discount,
          payment_method: payload.method,
          cash_received: payload.cashReceived ?? undefined,
        },
      }),
    onSuccess: res => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      clear();
      setPayOpen(false);
      setPayError(null);
      setReceiptOrder(res.data);
    },
    onError: err => {
      setPayError(
        err instanceof ApiError ? err.message : 'Checkout gagal, coba lagi.',
      );
    },
  });

  const products = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];

  const effDiscount = useMemo(() => Math.min(discount, subtotal), [discount, subtotal]);
  const tax = Math.round((subtotal - effDiscount) * TAX_RATE);
  const total = subtotal - effDiscount + tax;

  const handleComplete = (payload: CheckoutPayload) => {
    setPayError(null);
    checkoutMutation.mutate(payload);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:h-full lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Katalog produk */}
      <section className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 lg:min-h-0">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari produk atau SKU..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory('all')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              category === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            Semua
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                category === c.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-4 grid min-h-0 flex-1 content-start grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
          {productsQuery.isLoading && (
            <div className="col-span-full flex justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
            </div>
          )}
          {products.map(p => (
            <ProductCard key={p.id} product={p} onAdd={addItem} />
          ))}
          {!productsQuery.isLoading && products.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={PackageOpen}
                title="Produk tidak ditemukan"
                description="Coba kata kunci atau kategori lain."
              />
            </div>
          )}
        </div>
      </section>

      {/* Keranjang */}
      <aside className="min-h-0">
        <CartPanel onBayar={() => setPayOpen(true)} />
      </aside>

      {payOpen && (
        <PaymentModal
          items={items}
          discount={effDiscount}
          total={total}
          error={checkoutMutation.isPending ? null : payError}
          loading={checkoutMutation.isPending}
          onCancel={() => setPayOpen(false)}
          onComplete={handleComplete}
        />
      )}
      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
    </div>
  );
}
