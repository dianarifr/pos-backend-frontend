import type { Order } from '../../types';
import { formatRupiah, formatTanggalJam } from '../../lib/format';
import { PAYMENT_LABELS, STORE_ADDRESS, STORE_NAME } from '../../lib/constants';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

export default function ReceiptView({ order }: { order: Order }) {
  return (
    <div className="print-area mx-auto w-full max-w-xs bg-white p-5 font-mono text-xs text-gray-800">
      <div className="text-center">
        <p className="text-sm font-bold tracking-widest">{STORE_NAME}</p>
        <p className="mt-0.5 text-[10px] text-gray-500">{STORE_ADDRESS}</p>
      </div>

      <div className="my-3 border-t border-dashed border-gray-300" />

      <div className="space-y-1 text-[10px]">
        <Row label="No. Order" value={order.order_no} />
        <Row label="Waktu" value={formatTanggalJam(order.datetime)} />
        <Row label="Kasir" value={order.cashier ?? '-'} />
      </div>

      <div className="my-3 border-t border-dashed border-gray-300" />

      <div className="space-y-1.5">
        {order.items.map(it => (
          <div key={it.product_id}>
            <p className="font-semibold">{it.name}</p>
            <div className="flex justify-between">
              <span className="text-gray-500">
                {it.qty} x {formatRupiah(it.price)}
              </span>
              <span className="font-semibold">{formatRupiah(it.qty * it.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-3 border-t border-dashed border-gray-300" />

      <div className="space-y-1">
        <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
        {order.discount > 0 && <Row label="Diskon" value={`-${formatRupiah(order.discount)}`} />}
        <Row label="PPN 11%" value={formatRupiah(order.tax)} />
        <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-sm font-extrabold">
          <span>TOTAL</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
        <Row
          label={`Bayar (${PAYMENT_LABELS[order.method] ?? order.method})`}
          value={formatRupiah(order.method === 'tunai' ? (order.cash_received ?? 0) : order.total)}
        />
        {order.change !== null && <Row label="Kembalian" value={formatRupiah(order.change)} />}
      </div>

      <div className="my-3 border-t border-dashed border-gray-300" />

      <div className="text-center text-[10px] text-gray-500">
        <p className="font-semibold text-gray-700">Terima kasih atas kunjungan Anda 🙏</p>
        <p>Struk ini adalah bukti pembayaran yang sah</p>
      </div>
    </div>
  );
}
