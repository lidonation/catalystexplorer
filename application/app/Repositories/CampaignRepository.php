<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Campaign;

class CampaignRepository extends Repository
{
    public function __construct(Campaign $model)
    {
        parent::__construct($model);
    }
}
