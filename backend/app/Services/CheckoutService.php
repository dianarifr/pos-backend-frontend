<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public const TAX_RATE = 0.11;

    /**
     * Memproses checkout: validasi stok, hitung total, simpan order + item,
     * kurangi stok produk — semuanya dalam satu transaksi database.
     *
     * @param  array<int, array{product_id: int, qty: int}>  $items
     * @return Order Order yang sudah dibuat beserta items-nya
     *
     * @throws ValidationException Jika stok tidak mencukupi atau produk tidak valid
     */
    public function checkout(
        int $userId,
        array $items,
        int $discount = 0,
        PaymentMethod $paymentMethod = PaymentMethod::Tunai,
        ?int $cashReceived = null,
    ): Order {
        return DB::transaction(function () use ($userId, $items, $discount, $paymentMethod, $cashReceived): Order {
            $products = Product::query()
                ->whereIn('id', collect($items)->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Validasi produk & stok
            foreach ($items as $line) {
                $product = $products->get($line['product_id']);

                if ($product === null || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ['Produk tidak ditemukan atau tidak aktif.'],
                    ]);
                }

                if ($product->stock < $line['qty']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stok {$product->name} tidak mencukupi (sisa {$product->stock})."],
                    ]);
                }
            }

            $subtotal = collect($items)
                ->sum(fn (array $line): int => (int) $products[$line['product_id']]->price * $line['qty']);

            $discount = max(0, min($discount, $subtotal));
            $tax = (int) round(($subtotal - $discount) * self::TAX_RATE);
            $total = $subtotal - $discount + $tax;

            if ($paymentMethod === PaymentMethod::Tunai && ($cashReceived ?? 0) < $total) {
                throw ValidationException::withMessages([
                    'cash_received' => ['Uang diterima tidak mencukupi (total '.$total.').'],
                ]);
            }

            $order = new Order([
                'order_no' => $this->nextOrderNo(),
                'user_id' => $userId,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'cash_received' => $paymentMethod === PaymentMethod::Tunai ? $cashReceived : null,
                'change_amount' => $paymentMethod === PaymentMethod::Tunai ? ($cashReceived - $total) : null,
            ]);
            $order->save();

            foreach ($items as $line) {
                $product = $products[$line['product_id']];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'qty' => $line['qty'],
                    'subtotal' => $product->price * $line['qty'],
                ]);

                $product->decrement('stock', $line['qty']);
            }

            return $order->load('items');
        });
    }

    /**
     * Nomor order berformat TRX-YYYYMMDD-NNN berdasarkan jumlah order hari ini.
     */
    private function nextOrderNo(): string
    {
        $key = now()->format('Ymd');
        $sequence = Order::query()->whereDate('created_at', today())->count() + 1;

        return sprintf('TRX-%s-%03d', $key, $sequence);
    }
}
