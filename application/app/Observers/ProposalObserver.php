<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\GenerateModelEmbeddingsJob;
use App\Models\Proposal;

class ProposalObserver
{
    /** Handle the Proposal "created" event.*/
    public function created(Proposal $proposal): void
    {
        // Generate embeddings for the newly created proposal in the background
        GenerateModelEmbeddingsJob::dispatch($proposal);
    }

    /** Handle the Proposal "updated" event.*/
    public function updated(Proposal $proposal): void
    {
        // Check if any embeddable fields were changed
        $embeddableFields = $proposal->getEmbeddableFields();
        $hasEmbeddableChanges = false;

        foreach ($embeddableFields as $field) {
            if ($field === 'combined') {
                // For combined field, check if any of the constituent fields changed
                $constituentFields = ['title', 'problem', 'solution', 'experience', 'content'];
                foreach ($constituentFields as $constituentField) {
                    if ($proposal->wasChanged($constituentField)) {
                        $hasEmbeddableChanges = true;
                        break 2; // Break out of both loops
                    }
                }
            } elseif ($proposal->wasChanged($field)) {
                $hasEmbeddableChanges = true;
                break;
            }
        }

        // Only dispatch the job if embeddable content has changed
        if ($hasEmbeddableChanges) {
            GenerateModelEmbeddingsJob::dispatch($proposal);
        }
    }

    /** Handle the Proposal "deleted" event.*/
    public function deleted(Proposal $proposal): void
    {
        //
    }

    /** Handle the Proposal "restored" event.*/
    public function restored(Proposal $proposal): void
    {
        //
    }

    /** Handle the Proposal "force deleted" event.*/
    public function forceDeleted(Proposal $proposal): void
    {
        //
    }
}
