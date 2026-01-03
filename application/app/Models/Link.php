<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasModel;
use App\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Link extends Model
{
    use HasModel, HasTimestamps, HasTranslations, HasUuids, Searchable, SoftDeletes;

    public array $translatable = [
        'title',
        'label',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['type', 'link', 'label', 'title', 'status', 'order', 'valid'];

    public $meiliIndexName = 'cx_links';

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index', [
            'model' => Link::class,
            'name' => 'cx_links',
        ]);
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'type',
            'status',
            'valid',
            'model_type',
            'model_id',
            'order',
            'created_at',
            'updated_at',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'label',
            'link',
            'type',
            'status',
            'model_type',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'title',
            'type',
            'status',
            'model_type',
            'created_at',
            'updated_at',
            'order',
        ];
    }

    public static function getRankingRules(): array
    {
        return [
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness',
        ];
    }

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // Add model relationship data from pivot table
        $modelLink = \DB::table('model_links')
            ->where('link_id', $this->id)
            ->first();

        if ($modelLink) {
            $array['model_type'] = $modelLink->model_type;
            $array['model_id'] = $modelLink->model_id;

            // Include related model data for SingleLinkCard component
            if ($modelLink->model_type === 'App\\Models\\Proposal') {
                $proposal = \App\Models\Proposal::with(['fund', 'campaign'])->find($modelLink->model_id);
                if ($proposal) {
                    $array['proposal_data'] = [
                        'title' => $proposal->title,
                        'amountRequested' => $proposal->amount_requested,
                        'currency' => $proposal->currency ?? 'ADA',
                        'fund_title' => $proposal->fund?->title,
                        'campaign_title' => $proposal->campaign?->title,
                        'slug' => $proposal->slug,
                        'link' => $proposal->slug ? route('proposals.proposal.details', $proposal->slug) : null,
                    ];
                }
            } elseif ($modelLink->model_type === 'App\\Models\\Service') {
                $service = \App\Models\Service::with('user')->find($modelLink->model_id);
                if ($service) {
                    $array['service_data'] = [
                        'title' => $service->title,
                        'name' => $service->name,
                        'user_name' => $service->user?->name,
                        'type' => $service->type,
                        'slug' => $service->slug,
                        'link' => $service->slug ? route('services.show', $service->slug) : null,
                    ];
                }
            }
        } else {
            $array['model_type'] = null;
            $array['model_id'] = null;
            $array['proposal_data'] = null;
            $array['service_data'] = null;
        }

        return $array;
    }
}
