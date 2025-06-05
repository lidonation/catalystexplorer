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
        'path' => '/en',
        'component' => 'Home/Index',
    ],
    [
        'path' => '/en/bookmarks',
        'component' => 'Bookmarks/Index',
    ],
    [
        'path' => '/en/communities',
        'component' => 'Communities/Index',
    ],
    [
        'path' => '/en/completed-project-nfts',
        'component' => 'CompletedProjectNfts/Index',
    ],
    // [
    //     'path' => '/en/confirm-password',
    //     'component' => 'Auth/ConfirmPassword',
    // ],,
    // [
    //     'path' => '/en/forgot-password',
    //     'component' => 'Auth/ForgotPassword',
    // ],
    [
        'path' => '/en/connections',
        'component' => 'Connections/Index',
    ],
    [
        'path' => '/en/dreps',
        'component' => 'Dreps/Index',
    ],
    [
        'path' => '/en/dreps/list',
        'component' => 'Dreps/DrepList',
    ],
    [
        'path' => '/en/funds',
        'component' => 'Funds/Index',
    ],
    [
        'path' => '/en/groups',
        'component' => 'Groups/Index',
    ],
    [
        'path' => '/en/ideascale-profiles',
        'component' => 'IdeascaleProfile/Index',
    ],
    [
        'path' => '/en/jormungandr/transactions',
        'component' => 'Transactions/Index',
    ],
    [
        'path' => '/en/proposals',
        'component' => 'Proposals/Index',
    ],
    [
        'path' => '/en/reviews',
        'component' => 'Reviews/Index',
    ],
    [
        'path' => '/en/list',
        'component' => 'Bookmarks/Index',
    ],
    [
        'path' => '/en/workflows/completed-projects-nfts/steps/1',
        'component' => 'Workflows/CompletedProjectNfts/Step1',
    ],
    [
        'path' => '/en/workflows/claim-ideascale-profile/steps/1',
        'component' => 'Workflows/ClaimIdeascaleProfile/Step1',
    ],
]);
