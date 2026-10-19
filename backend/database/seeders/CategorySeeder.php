<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $categories = ['Kopi', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];

        foreach ($categories as $name) {
            Category::factory()->create(['name' => $name]);
        }
    }
}
