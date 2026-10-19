<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Support\Money;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PosStatsOverview extends BaseWidget
{
    /**
     * @return array<int, Stat>
     */
    protected function getStats(): array
    {
        $today = Order::query()->whereDate('created_at', today());

        return [
            Stat::make('Penjualan Hari Ini', Money::format((clone $today)->sum('total')))
                ->description('Total omzet hari ini')
                ->color('success'),
            Stat::make('Transaksi Hari Ini', (clone $today)->count())
                ->description('Jumlah transaksi hari ini'),
            Stat::make('Omzet 7 Hari', Money::format(Order::query()->where('created_at', '>=', today()->subDays(6))->sum('total')))
                ->description('7 hari terakhir')
                ->color('info'),
            Stat::make('Stok Menipis', Product::query()->where('is_active', true)->where('stock', '<=', 5)->count())
                ->description('Produk dengan stok ≤ 5')
                ->color('warning'),
        ];
    }
}
