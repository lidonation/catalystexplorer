<?php

arch()
    ->expect('App\Models')
    ->toBeClasses()
    ->toExtend('App\Models\BaseModel')
    ->ignoring('App\Models\User');;
