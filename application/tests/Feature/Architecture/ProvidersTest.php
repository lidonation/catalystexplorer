<?php

arch()
    ->expect('App\Providers')
    ->toBeClasses()
    ->toExtend('Illuminate\Support\ServiceProvider');
