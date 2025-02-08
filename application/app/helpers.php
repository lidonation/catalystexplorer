<?php

use App\DataTransferObjects\ProposalData;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

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
}
