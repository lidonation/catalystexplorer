<?php
use App\Providers;
use Illuminate\Support\ServiceProvider;
arch()
    ->expect(Providers::class)
    ->toBeClasses()
    ->toExtend(ServiceProvider::class);
