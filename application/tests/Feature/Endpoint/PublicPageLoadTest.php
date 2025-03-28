<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;

it('renders all public pages', function (string $path, string $component) {
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
//    [
//        'path' => '/en/confirm-password',
//        'component' => 'Auth/ConfirmPassword',
//    ],,
//    [
//        'path' => '/en/forgot-password',
//        'component' => 'Auth/ForgotPassword',
//    ],
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
]);
