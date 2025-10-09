<?php

arch()
    ->expect('App\Http\Controllers')
    ->toBeClasses()
    ->ignoring([
        'App\Http\Controllers\Concerns'
    ]);

arch()
    ->expect('App\Http\Controllers')
    ->toHaveSuffix('Controller')
    ->ignoring([
        'App\Http\Controllers\Concerns'
    ]);
