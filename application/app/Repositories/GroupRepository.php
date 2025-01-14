<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Group;

class GroupRepository extends Repository
{
    public function __construct(Group $model)
    {
        parent::__construct($model);
    }
}
