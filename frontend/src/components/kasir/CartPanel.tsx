import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../lib/format';
import { TAX_LABEL, TAX_RATE } from '../../lib/constants';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

interface Props {
  onBayar: () => void;
}

export default function CartPanel({ onBayar }: Props) {
  const { items, setQty, removeItem, clear, discount, setDiscount, count, subtotal } = useCart();

  const effDiscount = Math.min(discount, subtotal);
  const tax = Math.round((subtotal - effDiscount) * TAX_RATE);
  const total = subtotal - effDiscount + tax;

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white lg:h-full">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-primary-600" />
          <h2 className="font-bold text-gray-900">Pesanan</h2>
          {count > 0 && <Badge color="orange">{count} item</Badge>}
        </div>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="text-xs font-semibold text-gray-400 transition-colors hover:text-rose-500"
          >
            Kosongkan
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Keranjang kosong"
          description="Klik produk di sebelah kiri untuk menambah ke keranjang."
        />
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {items.map(({ product: p, qty }) => (
            <div key={p.id} className="flex items-center gap-2.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${p.color}`}
              >
                {p.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{formatRupiah(p.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQty(p.id, qty - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600"
                  aria-label="Kurangi"
                >
                  <Minus size={13} />
                </button>
                <span className="w-7 text-center text-sm font-bold text-gray-800">{qty}</span>
                <button
                  onClick={() => setQty(p.id, qty + 1)}
                  disabled={qty >= p.stock}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600 disabled:opacity-40"
                  aria-label="Tambah"
                >
                  <Plus size={13} />
                </button>
              </div>
              <button
                onClick={() => removeItem(p.id)}
                className="text-gray-300 transition-colors hover:text-rose-500"
                aria-label="Hapus"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="text-xs font-semibold text-gray-500">Diskon (Rp)</label>
            <input
              type="number"
              min={0}
              value={discount || ''}
              placeholder="0"
              onChange={e => setDiscount(Math.max(0, Number(e.target.value) || 0))}
              className="h-9 w-28 rounded-lg border border-gray-200 px-3 text-right text-sm font-semibold focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-700">{formatRupiah(subtotal)}</span>
            </div>
            {effDiscount > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Diskon</span>
                <span className="font-semibold text-rose-500">-{formatRupiah(effDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>{TAX_LABEL}</span>
              <span className="font-semibold text-gray-700">{formatRupiah(tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-extrabold text-primary-600">{formatRupiah(total)}</span>
            </div>
          </div>

          <Button className="mt-4 w-full" size="lg" onClick={onBayar}>
            Bayar <ArrowRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
