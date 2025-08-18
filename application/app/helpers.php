<?php

use App\DataTransferObjects\ProposalData;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Fluent;

if (! function_exists('to_length_aware_paginator')) {
    function to_review_item($items) {}
}

if (! function_exists('to_length_aware_paginator')) {
    function to_length_aware_paginator($items, $total = null, $perPage = null, $currentPage = null): LengthAwarePaginator|AbstractPaginator
    {
        if ($items instanceof Paginator) {
            $total = $items->total();
            $perPage = $items->perPage();
            $currentPage = $items->currentPage();
            $items = $items->items();
        } elseif (! $items instanceof Collection) {
            $items = ProposalData::collect($items);
        }

        // Set default values to prevent division by zero
        $total = $total ?? count($items);
        $perPage = $perPage ?? 15; // Default per page
        $currentPage = $currentPage ?? 1; // Default current page

        $pagination = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $currentPage,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1);
    }

    function toFluentDeep(array $array): Fluent
    {
        $result = [];

        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $result[$key] = toFluentDeep($value);
            } else {
                $result[$key] = $value;
            }
        }

        return new Fluent($result);
    }
}
