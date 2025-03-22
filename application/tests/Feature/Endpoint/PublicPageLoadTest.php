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
//    ],
    [
        'path' => '/en/connections',
        'component' => 'Connections/Index',
    ],
]);
