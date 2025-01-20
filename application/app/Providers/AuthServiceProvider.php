<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\RoleEnum;
use App\Models\User;
use App\Models\BookmarkItem;
use App\Models\BookmarkCollection;
use App\Policies\BookmarkItemPolicy;
use App\Policies\BookmarkCollectionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    protected $policies = [
        BookmarkItem::class => BookmarkItemPolicy::class,
        BookmarkCollection::class => BookmarkCollectionPolicy::class,
    ];

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
