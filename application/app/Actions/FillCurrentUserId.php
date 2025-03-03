<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Model;
use Illuminate\Support\Facades\Auth;

class FillCurrentUserId
{
    public function __invoke(Model &$model): void
    {
        $this->handle($model);
    }

    public function handle(Model &$model): void
    {
        // Fill the current user id
        if (Auth::check()) {
            $model->user_id = Auth::id();
        }
    }
}
