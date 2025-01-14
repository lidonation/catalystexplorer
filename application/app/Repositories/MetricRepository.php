<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Metric;

class MetricRepository extends Repository
{
    public function __construct(Metric $model)
    {
        parent::__construct($model);
    }
}
