<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\IdeascaleProfile;

class IdeascaleProfileRepository extends Repository
{
    public function __construct(IdeascaleProfile $model)
    {
        parent::__construct($model);
    }
}
