<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Enums\RoleEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory([
            'name' => 'Explorer Dora',
            'email' => 'admin@catalystexplorer.com',
            'password' => Hash::make('ofnXIFbZ0JOuGBqx-'),
        ])->hasAttached(Role::where('name', RoleEnum::super_admin())->first())
            ->create();

        User::factory(7)->create()->each(
            function (User $user) {
                if ($imageLink = $this->getRandomImageLink()) {
                    $user->addMediaFromUrl($imageLink)->toMediaCollection('profile');
                }
            }
        );
    }
}
