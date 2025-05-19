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
        'path' => '/en/workflows/completed-projects-nfts/steps/1',
        'component' => 'Workflows/CompletedProjectNfts/Step1',
    ],
    [
        'path' => '/en/workflows/claim-ideascale-profile/steps/1',
        'component' => 'Workflows/ClaimIdeascaleProfile/Step1',
    ],
]);
