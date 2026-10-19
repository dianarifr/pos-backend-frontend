<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_kasir_dapat_login_dan_menerima_token(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'test',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'is_admin']]);
    }

    public function test_checkout_membuat_order_mengurangi_stok_dan_menghitung_total(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 10000, 'stock' => 5]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/orders', [
            'items' => [
                ['product_id' => $product->id, 'qty' => 2],
            ],
            'discount' => 2000,
            'payment_method' => 'tunai',
            'cash_received' => 50000,
        ]);

        // subtotal 20.000 - diskon 2.000 = 18.000; PPN 11% = 1.980; total = 19.980
        $response->assertCreated();
        $response->assertJsonFragment([
            'subtotal' => 20000,
            'discount' => 2000,
            'tax' => 1980,
            'total' => 19980,
            'change' => 30020,
        ]);

        $this->assertDatabaseHas('orders', ['total' => 19980]);
        $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'qty' => 2]);
        $this->assertSame(3, $product->fresh()->stock);
    }

    public function test_checkout_ditolak_jika_stok_tidak_mencukupi(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 1]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/orders', [
            'items' => [
                ['product_id' => $product->id, 'qty' => 5],
            ],
            'payment_method' => 'qris',
        ]);

        $response->assertUnprocessable();
        $this->assertSame(1, $product->fresh()->stock);
    }

    public function test_daftar_produk_bisa_dicari(): void
    {
        $user = User::factory()->create();
        Product::factory()->create(['name' => 'Kopi Susu']);
        Product::factory()->create(['name' => 'Es Teh']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/products?search=kopi');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['name' => 'Kopi Susu']);
    }

    public function test_checkout_ditolak_jika_uang_tunai_kurang_dari_total(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 10000, 'stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/orders', [
            'items' => [
                ['product_id' => $product->id, 'qty' => 2],
            ],
            'payment_method' => 'tunai',
            'cash_received' => 15000, // total 22.200 > 15.000
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_endpoint_terlindungi_tanpa_token(): void
    {
        $this->getJson('/api/v1/products')->assertUnauthorized();
    }
}
