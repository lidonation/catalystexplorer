<?php

declare(strict_types=1);

namespace App\Interfaces;

use Illuminate\Database\Eloquent\Relations\HasMany;

interface IHasMetaData
{
    public function metas(): HasMany;

    public function saveMeta(string $key, string $content, self $model, $updateIfExist = true);
}
