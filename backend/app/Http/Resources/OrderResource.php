<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_no' => $this->order_no,
            'datetime' => $this->created_at?->toIso8601String(),
            'cashier' => $this->whenLoaded('user', fn (): ?string => $this->user?->name),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'tax' => $this->tax,
            'total' => $this->total,
            'method' => $this->payment_method->value,
            'method_label' => $this->payment_method->label(),
            'cash_received' => $this->cash_received,
            'change' => $this->change_amount,
        ];
    }
}
