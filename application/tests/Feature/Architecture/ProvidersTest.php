<?php

use Illuminate\Support\ServiceProvider;

arch()
    ->expect('App\Providers')
    ->toBeClasses()
    ->toExtend(ServiceProvider::class);
