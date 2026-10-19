<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * Riwayat transaksi (terbaru dulu).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $method = $request->string('method')->toString();
        $search = $request->string('search')->toString();

        $orders = Order::query()
            ->with(['items', 'user'])
            ->when($method !== '', fn ($query) => $query->where('payment_method', $method))
            ->when($search !== '', fn ($query) => $query->where(function ($where) use ($search) {
                $where->where('order_no', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate(20);

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        return OrderResource::make($order->load(['items', 'user']));
    }

    /**
     * Checkout: simpan transaksi baru.
     */
    public function store(StoreOrderRequest $request, CheckoutService $checkoutService): JsonResponse
    {
        $data = $request->validatedWithCasts();

        $order = $checkoutService->checkout(
            userId: $request->user()->id,
            items: $data['items'],
            discount: $data['discount'],
            paymentMethod: $data['payment_method'],
            cashReceived: $data['cash_received'],
        );

        return OrderResource::make($order)->response()->setStatusCode(201);
    }
}
