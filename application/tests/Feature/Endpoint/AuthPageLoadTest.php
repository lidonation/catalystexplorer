<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);


it('renders all public pages', function (string $path, string $component) {
    $user = User::factory()->create();

    Auth::login($user->first());

    $this->get($path)
        ->assertOk()
        ->assertInertia(fn(Assert $page) => $page->component($component));
})->with([
    [
        'path' => '/en/my/dashboard',
        'component' => 'My/Dashboard',
    ],
    [
        'path' => '/en/my/profile',
        'component' => 'My/Profile/Index',
    ],
    [
        'path' => '/en/my/reviews',
        'component' => 'My/Reviews/Index',
    ],
    [
        'path' => '/en/my/proposals',
        'component' => 'My/Proposals/Index',
    ],
    [
        'path' => '/en/my/groups',
        'component' => 'My/Groups/Index',
    ],
    [
        'path' => '/en/my/communities',
        'component' => 'My/Communities/Index',
    ],
    [
        'path' => '/en/my/lists',
        'component' => 'My/Lists/Index',
    ],
    // [
    //     'path' => '/en/my/transactions',
    //     'component' => 'My/Transactions/Index',
    // ],
    // [
    //     'path' => '/en/my/votes',
    //     'component' => 'My/Votes/Votes',
    // ],
]);
