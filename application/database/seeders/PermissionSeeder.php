<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect(PermissionEnum::toValues())->each(callback: function ($permission) {
            Permission::findOrCreate($permission);
        });
    }
}
