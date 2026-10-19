<?php

namespace Database\Seeders;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Transaksi dummy selama 7 hari terakhir (deterministik).
     */
    public function run(): void
    {
        $products = Product::query()->get();
        $cashiers = User::query()->where('is_admin', false)->pluck('id')->all();

        if ($products->isEmpty() || $cashiers === []) {
            return;
        }

        // PRNG deterministik agar hasil seed konsisten
        $seed = 987654321;
        $rnd = function () use (&$seed): float {
            $seed = ($seed * 1103515245 + 12345) % 2147483648;

            return $seed / 2147483648;
        };
        $pick = fn (array $values): mixed => $values[(int) floor($rnd() * count($values))];

        $raw = [];
        $now = Carbon::now();

        for ($dayOffset = 6; $dayOffset >= 0; $dayOffset--) {
            $count = $dayOffset === 0 ? 4 : 2 + (int) floor($rnd() * 3);

            for ($k = 0; $k < $count; $k++) {
                if ($dayOffset === 0) {
                    // Order "hari ini" tersebar dalam 5 jam terakhir agar
                    // statistik hari ini tidak kosong kapan pun dijalankan
                    $datetime = $now->copy()->subMinutes((int) floor($rnd() * 300));
                } else {
                    $datetime = $now->copy()->subDays($dayOffset);
                    $datetime->setTime(9 + (int) floor($rnd() * 11), (int) floor($rnd() * 60), 0);
                }

                $lineCount = 1 + (int) floor($rnd() * 4);
                $chosen = collect();
                while ($chosen->count() < $lineCount) {
                    $product = $pick($products->all());
                    if (! $chosen->contains('id', $product->id)) {
                        $chosen->push($product);
                    }
                }

                $items = $chosen
                    ->map(fn (Product $product): array => [
                        'product' => $product,
                        'qty' => 1 + (int) floor($rnd() * 3),
                    ])
                    ->values();

                $subtotal = (int) $items->sum(fn (array $line): int => $line['product']->price * $line['qty']);
                $discount = $rnd() < 0.25 ? (int) (round($subtotal * (0.05 + $rnd() * 0.1) / 500) * 500) : 0;
                $tax = (int) round(($subtotal - $discount) * 0.11);
                $total = $subtotal - $discount + $tax;
                $method = $pick([PaymentMethod::Tunai, PaymentMethod::Qris, PaymentMethod::Kartu]);
                $cashReceived = $method === PaymentMethod::Tunai ? (int) (ceil($total / 5000) * 5000) : null;

                $raw[] = [
                    'datetime' => $datetime,
                    'user_id' => $pick($cashiers),
                    'items' => $items,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'tax' => $tax,
                    'total' => $total,
                    'payment_method' => $method,
                    'cash_received' => $cashReceived,
                    'change_amount' => $cashReceived === null ? null : $cashReceived - $total,
                ];
            }
        }

        // Urutkan dari waktu terlama, lalu beri nomor order berurutan per hari
        usort($raw, fn (array $a, array $b): int => $a['datetime']->lt($b['datetime']) ? -1 : 1);

        $counters = [];
        foreach ($raw as $row) {
            $key = $row['datetime']->format('Ymd');
            $counters[$key] = ($counters[$key] ?? 0) + 1;

            $order = new Order([
                'order_no' => sprintf('TRX-%s-%03d', $key, $counters[$key]),
                'user_id' => $row['user_id'],
                'subtotal' => $row['subtotal'],
                'discount' => $row['discount'],
                'tax' => $row['tax'],
                'total' => $row['total'],
                'payment_method' => $row['payment_method'],
                'cash_received' => $row['cash_received'],
                'change_amount' => $row['change_amount'],
            ]);
            $order->created_at = $row['datetime'];
            $order->updated_at = $row['datetime'];
            $order->save();

            foreach ($row['items'] as $line) {
                /** @var Product $product */
                $product = $line['product'];
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'qty' => $line['qty'],
                    'subtotal' => $product->price * $line['qty'],
                ]);
            }
        }
    }
}
