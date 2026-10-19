<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:999'],
            'discount' => ['nullable', 'integer', 'min:0'],
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'cash_received' => [
                'nullable',
                'integer',
                'min:0',
                Rule::requiredIf(fn (): bool => $this->enum('payment_method', PaymentMethod::class) === PaymentMethod::Tunai),
            ],
        ];
    }

    /**
     * Siapkan data untuk service: enum instance + integer bersih.
     *
     * @return array{items: array<int, array{product_id: int, qty: int}>, discount: int, payment_method: PaymentMethod, cash_received: int|null}
     */
    public function validatedWithCasts(): array
    {
        $validated = $this->validated();

        return [
            'items' => array_map(
                fn (array $item): array => ['product_id' => (int) $item['product_id'], 'qty' => (int) $item['qty']],
                $validated['items'],
            ),
            'discount' => (int) ($validated['discount'] ?? 0),
            'payment_method' => $this->enum('payment_method', PaymentMethod::class),
            'cash_received' => isset($validated['cash_received']) ? (int) $validated['cash_received'] : null,
        ];
    }
}
