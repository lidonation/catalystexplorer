<?php
use App;

arch()
    ->expect(App::class)
    ->not->toUse(['die', 'dd', 'dump']);
