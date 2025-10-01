<?php

use App\Enums\CatalystFunds;
use Illuminate\Support\Facades\Schedule;

Schedule::command('catalyst:process-historical-funds', [
    '--fund' => CatalystFunds::FOURTEEN->value
] )->everyTenMinutes();

Schedule::command('model:prune')->daily();

Schedule::command('cx:sync-cardano-budget-proposals')
    ->everyTenMinutes();
