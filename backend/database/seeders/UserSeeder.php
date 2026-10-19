<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin Fullai',
            'email' => 'admin@posfullai.test',
            'is_admin' => true,
        ]);

        User::factory()->create([
            'name' => 'Dian',
            'email' => 'kasir@posfullai.test',
            'is_admin' => false,
        ]);

        User::factory()->create([
            'name' => 'Rina',
            'email' => 'rina@posfullai.test',
            'is_admin' => false,
        ]);

        User::factory()->create([
            'name' => 'Budi',
            'email' => 'budi@posfullai.test',
            'is_admin' => false,
        ]);
    }
}
