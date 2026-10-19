# POS Fullai — Frontend

Frontend aplikasi kasir: **Vite + React + TypeScript + Tailwind CSS v4**, warna utama oranye, Bahasa Indonesia, terhubung ke REST API Laravel (folder `../backend`).

## Menjalankan

```bash
npm install
npm run dev       # buka http://localhost:5173
```

Alamat API dikonfigurasi via `.env`:

```
VITE_API_URL=http://localhost:8000/api/v1
```

Backend harus jalan dulu: `php artisan serve` di folder `../backend` (lihat README backend).

## Login

| Akun | Email | Password | Akses |
|---|---|---|---|
| Kasir | kasir@posfullai.test | password | Kasir, Transaksi, Dashboard |
| Admin | admin@posfullai.test | password | Semua + panel Filament `/admin` |

## Fitur

- **Login** — autentikasi token Sanctum, sesi disimpan di localStorage, auto-redirect saat token kedaluwarsa.
- **Kasir** — katalog dari API (pencarian + filter kategori server-side), keranjang lokal, checkout `POST /orders` (stok & total dihitung server), struk siap cetak.
- **Produk** — CRUD penuh via API (`POST/PUT/DELETE /products`), SKU dibuat otomatis backend.
- **Transaksi** — riwayat terpaginasi, filter metode & pencarian server-side, detail struk.
- **Dashboard** — statistik & grafik dari `GET /dashboard`.

Data fetching memakai **TanStack Query**; keranjang tetap lokal (context) dan dikosongkan setelah checkout sukses.
