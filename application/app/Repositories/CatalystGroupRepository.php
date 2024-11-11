<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\CatalystGroup;

class CatalystGroupRepository extends Repository
{
    public function __construct(CatalystGroup $model)
    {
        parent::__construct($model);
    }
}
