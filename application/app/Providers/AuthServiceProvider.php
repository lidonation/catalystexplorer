<?php declare(strict_types=1);

namespace App\Providers;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{

    /**
     * Register services.
     */
    public function register(): void
    {
       //
    }


    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->setupPulse();

    }

    public function setupPulse(): void
    {
        Gate::define('viewPulse', function (User $user) {
            return $user->hasRole([
                RoleEnum::super_admin(),
                RoleEnum::admin(),
                RoleEnum::editor(),
                RoleEnum::contributor(),
            ]);
        });

//        Pulse::user(fn ($user) => [
//            'name' => $user->name,
//            'extra' => $user->email,
//            'avatar' => $user->avatar_url,
//        ]);
    }
}
