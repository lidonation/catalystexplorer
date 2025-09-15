<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TruncateValue
{
    public function __construct(
        protected Request $request,
        protected int $maxLength = 24
    ) {}

    public function __invoke($value): ?string
    {
        if ((bool) $value && $this->request->isResourceIndexRequest()) {
            $encoding = mb_detect_encoding($value);
            if ($encoding === 'UTF-8') {
                return $value;
                // $value =  mb_convert_encoding($value,  'UTF-8', 'auto');
            }

            return Str::truncate($value, $this->maxLength);
        }

        return $value;
    }
}
