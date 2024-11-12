<?php
use App\Models as Models;
use App\Models\BaseModel;
use App\Models\User;

arch()
    ->expect(Models::class)
    ->toBeClasses()
    ->toExtend(BaseModel::class)
    ->ignoring(User::class);