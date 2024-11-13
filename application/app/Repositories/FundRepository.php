<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Fund;

class FundRepository extends Repository
{
    public function __construct(Fund $model)
    {
        parent::__construct($model);
    }
}
