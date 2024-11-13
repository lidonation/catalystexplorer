<?php

use App\Contract\RepositoryInterface;

arch()
    ->expect('App')
    ->not->toUse(['die', 'dd', 'dump']);

arch('Use strict types declaration')
    ->expect('App')
    ->toUseStrictTypes();

arch()->preset()->php();

arch()->preset()->security();

arch('Do not use env helper in code')
    ->expect(['env'])
    ->not->toBeUsed();

arch('Action classes should be invokable')
    ->expect('App\Actions')
    ->toBeInvokable();

arch('Job classes should have handle method')
    ->expect('App\Jobs')
    ->toHaveMethod('handle');

arch('Repository classes should implement RepositoryInterface')
    ->expect('App\Repositories')
    ->toImplement(RepositoryInterface::class);

arch('Do not access session data in Async jobs')
    ->expect([
        'session',
        'auth',
        'request',
        'Illuminate\Support\Facades\Auth',
        'Illuminate\Support\Facades\Session',
        'Illuminate\Http\Request',
        'Illuminate\Support\Facades\Request'
    ])
    ->each->not->toBeUsedIn('App\Jobs');
