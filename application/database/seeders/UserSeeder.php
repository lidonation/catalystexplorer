<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Enums\RoleEnum;
use App\Jobs\AttachImageJob;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\Traits\GetImageLink;

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
                AttachImageJob::dispatch($user, collectionName: 'profile');
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

        AttachImageJob::dispatch($superUser, collectionName: 'profile');
    }
}
