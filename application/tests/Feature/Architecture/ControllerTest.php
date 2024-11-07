<?php

use App\Http\Controllers as Controllers;

arch()
    ->expect(Controllers::class)
    ->toBeClasses()
    ->toHaveSuffix('Controller');
