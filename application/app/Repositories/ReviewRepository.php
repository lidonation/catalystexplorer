<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Review;

class ReviewRepository extends Repository
{
    public function __construct(Review $model)
    {
        parent::__construct($model);
    }
}
