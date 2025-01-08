<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->makeSuperAdmin();

        User::factory(7)->create()->each(
            function (User $user) {
                if ($imageLink = $this->getRandomImageLink()) {
                    $user->addMediaFromUrl($imageLink)->toMediaCollection('profile');
                }
            }
        );
    }

    /**
     * Seeds super admin.
     */
    public function makeSuperAdmin(): void
    {
        $superUser = User::where('email', config('app.super_admin.email'))->first();

        if ((bool) $superUser) {
            return;
        }

        $superUserCred = collect(config('app.super_admin'))->map(function ($v, $k) {
            if ($k == 'password') {
                return Hash::make($v);
            } else {
                return $v;
            }
        });

        $superUser = User::factory(state: $superUserCred->toArray())
            ->hasAttached(Role::where('name', RoleEnum::super_admin())->first())
            ->create();

        if ($imageLink = $this->getRandomImageLink()) {
            $superUser->addMediaFromUrl($imageLink)->toMediaCollection('profile');
        }
    }
}
