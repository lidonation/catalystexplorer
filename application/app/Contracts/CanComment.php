<?php

declare(strict_types=1);

namespace App\Contracts;

use Illuminate\Database\Eloquent\Relations\MorphMany;

interface CanComment
{
    public function commentatorComments(): MorphMany;

    public function getKey();

    public function getMorphClass();
}
