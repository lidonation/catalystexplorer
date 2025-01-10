<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Model;

class FillCurrentUserId
{
    public function __invoke(Model &$model): void
    {
        $this->handle($model);
    }

    public function handle(Model &$model): void
    {
        // Fill the current user id
        if (auth()->check()) {
            $model->user_id = auth()->id();
        }
    }
}
