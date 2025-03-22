<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\TransactionData;
use App\Models\Transaction;
use Inertia\Inertia;

class TransactionController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transactions = Transaction::query()
            ->when(request('label'), function ($query, $label) {
                return $query->where('metadata_labels::jsonb @> ?', [json_encode([(int) $label])]);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Transactions/Index', [
            'transactions' => to_length_aware_paginator(
                TransactionData::collect($transactions)
            ),
            'metadataLabels' => [],
        ]);

    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $catalystTransaction)
    {
        $labels = [
            61284 => 'Catalyst voting registration',
            61285 => 'Catalyst voting submission',
            61286 => 'Catalyst voting rewards',
        ];

        // Get all labels as an array
        $labelIds = json_decode($catalystTransaction->metadata_labels ?? '[]', true);
        $labelNames = collect($labelIds)->map(function ($labelId) use ($labels) {
            return [
                'id' => $labelId,
                'name' => $labels[$labelId] ?? 'Unknown',
            ];
        })->toArray();

        return Inertia::render('Transactions/TxDetail', [
            'transaction' => $catalystTransaction,
            'metadataLabels' => $labelNames,
        ]);
    }
}
