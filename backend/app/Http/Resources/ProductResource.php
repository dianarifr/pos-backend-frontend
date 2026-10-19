<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'sku' => $this->sku,
            'name' => $this->name,
            'price' => $this->price,
            'stock' => $this->stock,
            'emoji' => $this->emoji,
            'color' => $this->color,
            'is_active' => $this->is_active,
            'category' => $this->whenLoaded('category', fn (): CategoryResource => CategoryResource::make($this->category)),
        ];
    }
}
