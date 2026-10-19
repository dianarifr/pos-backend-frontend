import type { Product } from '../../types';
import { formatRupiah } from '../../lib/format';

interface Props {
  product: Product;
  onAdd: (p: Product) => void;
}

export default function ProductCard({ product: p, onAdd }: Props) {
  const habis = p.stock <= 0;
  return (
    <button
      onClick={() => !habis && onAdd(p)}
      disabled={habis}
      className="group flex flex-col gap-2.5 rounded-2xl border border-gray-100 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md hover:shadow-primary-600/5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <div
        className={`relative flex h-24 items-center justify-center rounded-xl text-4xl ${p.color} transition-transform group-hover:scale-[1.03]`}
      >
        <span>{p.emoji}</span>
        {habis && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 text-xs font-bold text-rose-600">
            Habis
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-800">{p.name}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary-600">{formatRupiah(p.price)}</p>
        <span className={`text-[11px] font-semibold ${habis ? 'text-rose-500' : 'text-gray-400'}`}>
          Stok {p.stock}
        </span>
      </div>
    </button>
  );
}
