<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();

Schedule::command('cx:sync-cardano-budget-proposals')
    ->everyTenMinutes();
