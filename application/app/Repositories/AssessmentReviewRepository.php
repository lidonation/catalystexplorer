<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\AssessmentReview;

class AssessmentReviewRepository extends Repository
{
    public function __construct(AssessmentReview $model)
    {
        parent::__construct($model);
    }
}
