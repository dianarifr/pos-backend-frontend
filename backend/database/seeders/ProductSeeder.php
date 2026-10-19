<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Katalog produk dummy — sama dengan data awal frontend.
     */
    public function run(): void
    {
        $categoryId = Category::query()->pluck('id', 'name');

        $products = [
            // Kopi
            ['sku' => 'KPI-001', 'name' => 'Kopi Susu Gula Aren', 'category' => 'Kopi', 'price' => 18000, 'stock' => 42, 'emoji' => '☕', 'color' => 'bg-orange-100'],
            ['sku' => 'KPI-002', 'name' => 'Americano', 'category' => 'Kopi', 'price' => 16000, 'stock' => 38, 'emoji' => '☕', 'color' => 'bg-amber-100'],
            ['sku' => 'KPI-003', 'name' => 'Cappuccino', 'category' => 'Kopi', 'price' => 22000, 'stock' => 25, 'emoji' => '☕', 'color' => 'bg-orange-100'],
            ['sku' => 'KPI-004', 'name' => 'Matcha Latte', 'category' => 'Kopi', 'price' => 24000, 'stock' => 18, 'emoji' => '🍵', 'color' => 'bg-lime-100'],
            // Minuman
            ['sku' => 'MNM-001', 'name' => 'Es Teh Manis', 'category' => 'Minuman', 'price' => 5000, 'stock' => 80, 'emoji' => '🧊', 'color' => 'bg-sky-100'],
            ['sku' => 'MNM-002', 'name' => 'Es Jeruk', 'category' => 'Minuman', 'price' => 8000, 'stock' => 55, 'emoji' => '🍊', 'color' => 'bg-orange-100'],
            ['sku' => 'MNM-003', 'name' => 'Lemon Tea', 'category' => 'Minuman', 'price' => 9000, 'stock' => 47, 'emoji' => '🍋', 'color' => 'bg-yellow-100'],
            ['sku' => 'MNM-004', 'name' => 'Air Mineral', 'category' => 'Minuman', 'price' => 4000, 'stock' => 96, 'emoji' => '💧', 'color' => 'bg-blue-100'],
            // Makanan
            ['sku' => 'MKN-001', 'name' => 'Nasi Goreng Spesial', 'category' => 'Makanan', 'price' => 22000, 'stock' => 30, 'emoji' => '🍛', 'color' => 'bg-amber-100'],
            ['sku' => 'MKN-002', 'name' => 'Ayam Geprek', 'category' => 'Makanan', 'price' => 25000, 'stock' => 24, 'emoji' => '🍗', 'color' => 'bg-red-100'],
            ['sku' => 'MKN-003', 'name' => 'Mie Goreng Jawa', 'category' => 'Makanan', 'price' => 18000, 'stock' => 28, 'emoji' => '🍜', 'color' => 'bg-orange-100'],
            ['sku' => 'MKN-004', 'name' => 'Soto Ayam', 'category' => 'Makanan', 'price' => 20000, 'stock' => 22, 'emoji' => '🍲', 'color' => 'bg-yellow-100'],
            ['sku' => 'MKN-005', 'name' => 'Roti Bakar Cokelat', 'category' => 'Makanan', 'price' => 15000, 'stock' => 31, 'emoji' => '🍞', 'color' => 'bg-amber-100'],
            // Snack
            ['sku' => 'SNK-001', 'name' => 'Kentang Goreng', 'category' => 'Snack', 'price' => 15000, 'stock' => 40, 'emoji' => '🍟', 'color' => 'bg-yellow-100'],
            ['sku' => 'SNK-002', 'name' => 'Pisang Goreng', 'category' => 'Snack', 'price' => 10000, 'stock' => 26, 'emoji' => '🍌', 'color' => 'bg-amber-100'],
            ['sku' => 'SNK-003', 'name' => 'Donat Gula', 'category' => 'Snack', 'price' => 9000, 'stock' => 33, 'emoji' => '🍩', 'color' => 'bg-rose-100'],
            ['sku' => 'SNK-004', 'name' => 'Croissant', 'category' => 'Snack', 'price' => 14000, 'stock' => 4, 'emoji' => '🥐', 'color' => 'bg-orange-100'],
            ['sku' => 'SNK-005', 'name' => 'Cireng Rujak', 'category' => 'Snack', 'price' => 8000, 'stock' => 44, 'emoji' => '🥟', 'color' => 'bg-rose-100'],
            // Lainnya
            ['sku' => 'LNY-001', 'name' => 'Keripik Singkong', 'category' => 'Lainnya', 'price' => 12000, 'stock' => 50, 'emoji' => '🥔', 'color' => 'bg-violet-100'],
            ['sku' => 'LNY-002', 'name' => 'Tumbler Fullai', 'category' => 'Lainnya', 'price' => 85000, 'stock' => 12, 'emoji' => '🥤', 'color' => 'bg-violet-100'],
            ['sku' => 'LNY-003', 'name' => 'Top Up E-Money', 'category' => 'Lainnya', 'price' => 50000, 'stock' => 99, 'emoji' => '💳', 'color' => 'bg-sky-100'],
        ];

        foreach ($products as $product) {
            Product::factory()->create([
                'category_id' => $categoryId[$product['category']],
                'sku' => $product['sku'],
                'name' => $product['name'],
                'price' => $product['price'],
                'stock' => $product['stock'],
                'emoji' => $product['emoji'],
                'color' => $product['color'],
                'is_active' => true,
            ]);
        }
    }
}
