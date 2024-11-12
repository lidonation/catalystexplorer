<?php

use App\Models\Model;
use App\Models\User;

arch()
    ->expect('App\Models')
    ->toBeClasses()
    ->toExtend(Model::class)
    ->ignoring(User::class);
