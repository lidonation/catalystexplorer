<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\RoleEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Link;
use App\Models\Signature;
use App\Models\Snapshot;
use App\Models\User;
use App\Models\VotingPower;
use App\Policies\BookmarkCollectionPolicy;
use App\Policies\BookmarkItemPolicy;
use App\Policies\LinkPolicy;
use App\Policies\SignaturePolicy;
use App\Policies\SnapshotPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

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
        Link::class => LinkPolicy::class,
        Signature::class => SignaturePolicy::class,
        Snapshot::class => SnapshotPolicy::class,
        VotingPower::class => VotingPower::class,
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
