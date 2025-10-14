<?php

use App\Enums\CatalystFunds;
use Illuminate\Support\Facades\Schedule;


Schedule::command('model:prune')->daily();
//Schedule::command('job:dispatch SyncVotingResultsJob')->everyMinute();

//Schedule::command('cx:sync-cardano-budget-proposals')
//    ->everyTenMinutes();



// update tally
//Schedule::command('catalyst:process-historical-funds', [
//    '--fund' => CatalystFunds::FOURTEEN->value
//] )->everyTenMinutes();
