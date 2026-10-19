<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->numberBetween(10000, 200000);
        $discount = 0;
        $tax = (int) round(($subtotal - $discount) * 0.11);

        return [
            'order_no' => sprintf('TRX-%s-%06d', $this->faker->unique()->date('Ymd'), $this->faker->unique()->randomNumber(6)),
            'user_id' => User::factory(),
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $subtotal - $discount + $tax,
            'payment_method' => $this->faker->randomElement(PaymentMethod::cases()),
            'cash_received' => null,
            'change_amount' => null,
        ];
    }
}
