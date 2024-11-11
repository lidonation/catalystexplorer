<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ReviewModeration;

class ReviewRepository extends Repository
{
    public function __construct(ReviewModeration $model)
    {
        parent::__construct($model);
    }
}
