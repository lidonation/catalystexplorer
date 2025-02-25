<?php

arch('Services classes should have proper suffix')
    ->expect('App\Services')
    ->toHaveSuffix('Service');
