<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Katalog produk: aktif secara default, ?all=1 untuk memuat semuanya.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $search = $request->string('search')->toString();
        $categoryId = $request->integer('category');
        $includeInactive = $request->boolean('all');

        $products = Product::query()
            ->with('category')
            ->when(! $includeInactive, fn ($query) => $query->where('is_active', true))
            ->when($search !== '', fn ($query) => $query->where(function ($where) use ($search) {
                $where->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            }))
            ->when($categoryId > 0, fn ($query) => $query->where('category_id', $categoryId))
            ->orderBy('name')
            ->get();

        return ProductResource::collection($products);
    }

    public function show(Product $product): ProductResource
    {
        return ProductResource::make($product->load('category'));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        $category = Category::query()->findOrFail($data['category_id']);
        $product = Product::query()->create([
            ...$data,
            'sku' => $this->generateSku($category),
            'emoji' => $data['emoji'] ?? '🍽️',
            'color' => $data['color'] ?? 'bg-gray-100',
            'is_active' => $data['is_active'] ?? true,
        ]);

        return ProductResource::make($product->load('category'))->response()->setStatusCode(201);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $product->update($request->validated());

        return ProductResource::make($product->load('category'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    /**
     * Daftar kategori produk.
     */
    public function categories(): AnonymousResourceCollection
    {
        return CategoryResource::collection(Category::query()->orderBy('id')->get());
    }

    /**
     * SKU otomatis dari 3 huruf pertama nama kategori + angka acak unik.
     */
    private function generateSku(Category $category): string
    {
        $letters = preg_replace('/[^A-Za-z]/', '', $category->name) ?: 'PRD';
        $prefix = strtoupper(substr($letters, 0, 3));

        do {
            $sku = $prefix.'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (Product::query()->where('sku', $sku)->exists());

        return $sku;
    }
}
