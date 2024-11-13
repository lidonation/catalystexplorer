<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Community;

class CommunityRepository extends Repository
{
    public function __construct(Community $model)
    {
        parent::__construct($model);
    }
}