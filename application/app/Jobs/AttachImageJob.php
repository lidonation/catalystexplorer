<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Model;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spatie\Comments\Models\Comment;

class AttachImageJob implements ShouldQueue
{
    use Dispatchable, GetImageLink, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly Model|Authenticatable|Comment $model,
        public string $collectionName
    ) {}

    public function handle(): void
    {
        if ($this->collectionName == 'banner') {
            $this->addBanner();

            return;
        }

        if ($heroImageLink = $this->getRandomImageLink()) {
            $this->model
                ->addMediaFromUrl($heroImageLink)
                ->toMediaCollection($this->collectionName);
        }
    }

    public function addBanner(): void
    {
        if ($banner = $this->getRandomBannerImageLink()) {
            $this->model
                ->addMediaFromUrl($banner)
                ->toMediaCollection($this->collectionName);
        }
    }
}
