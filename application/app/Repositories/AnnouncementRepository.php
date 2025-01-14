<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Announcement;

class AnnouncementRepository extends Repository
{
    public function __construct(Announcement $model)
    {
        parent::__construct($model);
    }
}
