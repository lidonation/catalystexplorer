<?php

use App\Models\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

arch()
    ->expect('App\Models')
    ->toBeClasses()
    ->toExtend(Model::class)
    ->ignoring(User::class);

arch()
    ->expect('App\Models')
    ->not->toUseTrait(HasFactory::class)
    ->ignoring([
        User::class,
        Model::class
    ]);

arch()
    ->expect('App\Models')
    ->toOnlyBeUsedIn('App\Repositories')
    ->ignoring('App\Models');

