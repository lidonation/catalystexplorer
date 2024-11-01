<?php

arch()
    ->expect('App')
    ->not->toUse(['die', 'dd', 'dump']);
