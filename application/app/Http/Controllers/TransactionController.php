<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\CatalystTransaction;
use App\Models\Transaction;
use Inertia\Inertia;

class TransactionController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $catalystTransactions = CatalystTransaction::query()
                ->when(request('label'), function ($query, $label) {
                    return $query->whereRaw('metadata_labels::jsonb @> ?', [json_encode([(int) $label])]);
                })
                ->orderBy('block_id', 'desc')
                ->paginate(10);

            $catalystTransactions->getCollection()->transform(function ($transaction) {
                $transaction->metadata = json_decode($transaction->metadata, true);

                $labels = [
                    61284 => 'Catalyst voting registration',
                    61285 => 'Catalyst voting submission',
                    61286 => 'Catalyst voting rewards',
                ];

                $labelIds = json_decode($transaction->metadata_labels ?? '[]', true);
                $transaction->label_names = collect($labelIds)->map(function ($labelId) use ($labels) {
                    return $labels[$labelId] ?? 'Unknown';
                })->toArray();

                return $transaction;
            });

            $metadataLabels = [
                61284 => 'Catalyst voting registration',
                61285 => 'Catalyst voting submission',
                61286 => 'Catalyst voting rewards',
            ];

            return Inertia::render('Transactions/Index', [
                'catalystTransactions' => $catalystTransactions,
                'metadataLabels' => $metadataLabels,
            ]);
        } catch (\Exception $e) {
            // Log the error
            logger()->error('Catalyst Transaction error: '.$e->getMessage());

            return response()->json(['error' => 'An error occurred while fetching the transactions'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(CatalystTransaction $catalystTransaction)
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
    // public function show(Transaction $transaction)
    // {
    //     //
    // }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        //
    }
}
