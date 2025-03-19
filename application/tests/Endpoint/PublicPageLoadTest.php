<?php

declare(strict_types=1);

namespace Tests\Endpoint;

use Inertia\Testing\AssertableInertia as Assert;


it('renders all public pages', function (string $path, string $component) {
    $this->get($path)
        ->assertOk()
        ->assertInertia(fn(Assert $page) => $page->component($component));
})->with([
    [
        'path' => '/',
        'component' => 'Home/Index',
    ]
]);
