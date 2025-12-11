<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Meta;
use Illuminate\Support\Str;

class MetaObserver
{
    /**
     * Handle the Meta "creating" event.
     */
    public function creating(Meta $meta): void
    {
        if (empty($meta->id)) {
            $meta->id = (string) Str::uuid();
        }
    }
}
