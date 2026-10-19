<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_produk_bisa_ditambahkan_via_api_dengan_sku_otomatis(): void
    {
        $user = User::factory()->create();
        $this->seed(CategorySeeder::class);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', [
            'name' => 'Es Kopi Hitam',
            'category_id' => 1,
            'price' => 15000,
            'stock' => 20,
            'emoji' => '🧋',
            'color' => 'bg-orange-100',
            'is_active' => true,
        ]);

        $response->assertCreated();
        $response->assertJsonFragment(['name' => 'Es Kopi Hitam', 'price' => 15000]);

        $product = Product::query()->where('name', 'Es Kopi Hitam')->first();
        $this->assertNotNull($product);
        $this->assertMatchesRegularExpression('/^KOP-\d{4}$/', $product->sku);
    }

    public function test_produk_bisa_diperbarui_dan_dihapus(): void
    {
        $user = User::factory()->create();
        $this->seed(CategorySeeder::class);
        $product = Product::factory()->create(['name' => 'Nama Lama', 'price' => 10000]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/products/{$product->id}", [
                'name' => 'Nama Baru',
                'category_id' => $product->category_id,
                'price' => 12000,
                'stock' => 5,
            ])
            ->assertOk()
            ->assertJsonFragment(['name' => 'Nama Baru', 'price' => 12000]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/products/{$product->id}")
            ->assertOk();

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_validasi_produk_menolak_harga_tidak_valid(): void
    {
        $user = User::factory()->create();
        $this->seed(CategorySeeder::class);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/products', [
                'name' => 'Salah Harga',
                'category_id' => 1,
                'price' => -100,
                'stock' => 0,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    }
}
