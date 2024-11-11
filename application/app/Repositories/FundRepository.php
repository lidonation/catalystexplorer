<?php

namespace App\Repositories;

use App\Models\Fund;

class FundRepository extends Repository
{
    public function __construct(Fund $model)
    {
        parent::__construct($model);
    }
}
