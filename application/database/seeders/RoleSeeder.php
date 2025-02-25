<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect(array_values(RoleEnum::cases()))
            ->each(
                fn ($role) => Role::findOrCreate((string) $role)
            );
    }
}
