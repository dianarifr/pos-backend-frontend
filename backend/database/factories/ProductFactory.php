<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $emojis = ['☕', '🍜', '🍚', '🍩', '🥤', '🍟'];

        return [
            'category_id' => Category::factory(),
            'sku' => strtoupper($this->faker->unique()->lexify('???-???')),
            'name' => $this->faker->words(2, true),
            'price' => $this->faker->numberBetween(1000, 50000),
            'stock' => $this->faker->numberBetween(5, 100),
            'emoji' => $this->faker->randomElement($emojis),
            'color' => $this->faker->randomElement(['bg-orange-100', 'bg-sky-100', 'bg-amber-100', 'bg-rose-100']),
            'is_active' => true,
        ];
    }
}
