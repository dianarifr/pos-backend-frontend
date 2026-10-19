import { useState } from 'react';
import { Banknote, CheckCircle2, CreditCard, QrCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatRupiah } from '../../lib/format';
import type { CartItem, CheckoutPayload, PaymentMethod } from '../../types';

const METHODS: { id: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { id: 'tunai', label: 'Tunai', icon: Banknote },
  { id: 'qris', label: 'QRIS', icon: QrCode },
  { id: 'kartu', label: 'Kartu', icon: CreditCard },
];

/** QR palsu untuk simulasi pembayaran QRIS */
function FakeQr() {
  const N = 13;
  const cells: boolean[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const finders: Array<[number, number]> = [
        [0, 0],
        [0, N - 3],
        [N - 3, 0],
      ];
      const f = finders.find(([br, bc]) => r >= br && r < br + 3 && c >= bc && c < bc + 3);
      if (f) {
        const [br, bc] = f;
        const dr = r - br;
        const dc = c - bc;
        cells.push(dr === 0 || dr === 2 || dc === 0 || dc === 2);
      } else {
        cells.push((r * 31 + c * 17 + 5) % 7 < 3);
      }
    }
  }
  return (
    <div className="rounded-xl border-4 border-gray-900 bg-white p-2">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${N}, 8px)` }}>
        {cells.map((on, i) => (
          <div key={i} className={`h-2 w-2 ${on ? 'bg-gray-900' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
}

interface Props {
  items: CartItem[];
  discount: number;
  total: number;
  error?: string | null;
  loading?: boolean;
  onCancel: () => void;
  onComplete: (payload: CheckoutPayload) => void;
}

export default function PaymentModal({ items, discount, total, error = null, loading = false, onCancel, onComplete }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('tunai');
  const [cash, setCash] = useState(0);

  const change = cash - total;
  const canPay = method !== 'tunai' || cash >= total;
  const quickCash = [total, ...[50000, 100000, 150000, 200000].filter(v => v > total)];

  const confirm = () => {
    onComplete({ items, discount, method, cashReceived: method === 'tunai' ? cash : null });
  };

  return (
    <Modal open onClose={onCancel} title="Pembayaran" size="md">
      <div className="p-5">
        <div className="rounded-2xl bg-gray-50 p-4 text-center">
          <p className="text-xs font-semibold text-gray-400">Total Tagihan</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary-600">
            {formatRupiah(total)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {items.reduce((s, i) => s + i.qty, 0)} item • {items.length} produk
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-semibold transition-colors ${
                method === m.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              <m.icon size={20} />
              {m.label}
            </button>
          ))}
        </div>

        {method === 'tunai' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Uang Diterima</label>
              <div className="relative mt-1.5">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  value={cash || ''}
                  onChange={e => setCash(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  autoFocus
                  className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-right text-lg font-bold focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickCash.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setCash(v)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    cash === v
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {v === total ? 'Uang Pas' : formatRupiah(v)}
                </button>
              ))}
            </div>
            <div
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                cash === 0
                  ? 'bg-gray-50 text-gray-400'
                  : change >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-600'
              }`}
            >
              <span>{cash === 0 ? 'Menunggu input uang' : change >= 0 ? 'Kembalian' : 'Uang kurang'}</span>
              <span className="text-base font-extrabold">
                {cash === 0 ? '—' : formatRupiah(Math.abs(change))}
              </span>
            </div>
          </div>
        )}

        {method === 'qris' && (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 p-5">
            <FakeQr />
            <div className="text-center">
              <p className="text-sm font-bold text-gray-800">Scan QRIS untuk membayar</p>
              <p className="text-xs text-gray-400">Gunakan e-wallet atau m-banking apa pun</p>
            </div>
          </div>
        )}

        {method === 'kartu' && (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <CreditCard size={26} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Tempel atau gesek kartu</p>
              <p className="text-xs text-gray-400">Menunggu konfirmasi dari mesin EDC...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-gray-100 p-4">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button className="flex-1" disabled={!canPay || loading} onClick={confirm}>
          {loading ? 'Memproses...' : method === 'tunai' ? 'Bayar Sekarang' : 'Tandai Lunas'}{' '}
          <CheckCircle2 size={17} />
        </Button>
      </div>
    </Modal>
  );
}
