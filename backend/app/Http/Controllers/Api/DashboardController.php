<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Ringkasan untuk halaman dashboard frontend.
     */
    public function index(): JsonResponse
    {
        $today = CarbonImmutable::today();
        $now = CarbonImmutable::now();

        $todays = Order::query()
            ->whereBetween('created_at', [$today, $now])
            ->with('items')
            ->get();

        $revenueToday = (int) $todays->sum('total');
        $transactionsToday = $todays->count();
        $itemsSoldToday = (int) $todays->flatMap->items->sum('qty');
        $averageToday = $transactionsToday > 0 ? (int) round($revenueToday / $transactionsToday) : 0;
        $revenueWeek = (int) Order::query()->whereBetween('created_at', [$today->subDays(6)->startOfDay(), $now])->sum('total');

        $week = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $today->subDays($i);
            $week[] = [
                'date' => $day->toDateString(),
                'label' => $day->locale('id')->shortDayName,
                'total' => (int) Order::query()->whereBetween('created_at', [$day->startOfDay(), $day->endOfDay()])->sum('total'),
            ];
        }

        $topProducts = OrderItem::query()
            ->selectRaw('product_id, product_name, SUM(qty) as total_qty, SUM(qty * price) as total_revenue')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn (OrderItem $item): array => [
                'product_id' => $item->product_id,
                'name' => $item->product_name,
                'qty' => (int) $item->total_qty,
                'revenue' => (int) $item->total_revenue,
            ]);

        $recentOrders = Order::query()->with('user')->latest()->limit(5)->get();

        return response()->json([
            'today' => [
                'revenue' => $revenueToday,
                'transactions' => $transactionsToday,
                'items_sold' => $itemsSoldToday,
                'average' => $averageToday,
                'revenue_week' => $revenueWeek,
            ],
            'week' => $week,
            'top_products' => $topProducts,
            'recent_orders' => OrderResource::collection($recentOrders),
        ]);
    }
}
