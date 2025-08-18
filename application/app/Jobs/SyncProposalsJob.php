<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CatalystProfile;
use App\Models\Meta;
use App\Models\Proposal;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use JetBrains\PhpStorm\NoReturn;
use League\HTMLToMarkdown\HtmlConverter;

class SyncProposalsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private int $proposalId;

    /**
     * Create a new job instance.
     */
    public function __construct(public $proposalDetail, public string $fund)
    {
        $this->proposalDetail = toFluentDeep($proposalDetail);
    }

    /**
     * Execute the job.
     */
    #[NoReturn]
    public function handle(): void
    {
        $connection = DB::connection('pgsql');

        $proposalSummary = $this->proposalDetail->payload->summary;

        $categoryUuid = $this->proposalDetail->protected_headers->category_id[0];

        $campaignMeta = Meta::where([
            'model_type' => Campaign::class,
            'key' => 'catalyst_id',
            'content' => $categoryUuid,

        ])->latest()->first();

        $content = $this->processContent(
            $this->proposalDetail->payload->details,
            $this->proposalDetail->payload->campaign_category->category_questions
        );

        $title = ['en' => $this->proposalDetail->payload->setup->title->title];
        $slug = Str::limit(
            Str::slug($this->proposalDetail->payload->setup->title->title), 150, ''
        );

        //  $proposal->slug = Str::limit(Str::slug($proposal->title), 150, '').'-'.'f'.$fundNumber;

        // Search for existing proposal
        $existing = $connection->table('proposals')
            ->where('slug', '=', "{$slug}-f14")
            ->first();

        $data = [
            'title' => json_encode($title),
            'problem' => json_encode(['en' => $proposalSummary->problem->statement]),
            'solution' => json_encode(['en' => $proposalSummary->solution->summary]),
            'content' => json_encode(['en' => $content]),
            'amount_requested' => $proposalSummary->budget->requestedFunds,
            'fund_id' => $this->fund,
            'campaign_id' => $campaignMeta->model_id,
            'slug' => "{$slug}-f14",
            'status' => 'pending',
            'funding_status' => 'pending',
            'updated_at' => now(),
            'type' => 'proposal',
        ];

        if ($existing) {
            $connection->table('proposals')
                ->where('id', $existing->id)
                ->update($data);

            $this->proposalId = $existing->id;
        } else {
            $data['created_at'] = now();

            $this->proposalId = $connection->table('proposals')->insertGetId($data);
        }

        // Metas
        $this->processMetas(
            $proposalSummary->time->duration,
            $this->proposalDetail->payload->setup->proposer->type,
            $proposalSummary->open_source->isOpenSource
        );

        $this->processPrimaryAuthor($this->proposalDetail->payload->setup->proposer);

        $this->processTags($this->proposalDetail->payload->theme->theme->grouped_tag);
        Proposal::find($this->proposalId)?->searchable();
    }

    protected function processContent($content, $category_questions)
    {
        $converter = new HtmlConverter;
        $flatContent = collect($content)->mapWithKeys(function ($section) {
            $key = collect($section->toArray())->keys()->first();
            $value = $section->{$key};

            return [$key => $value];
        });

        $flatCategoryQuestions = collect($category_questions)->mapWithKeys(function ($value, $key) {
            return [$key => $value];
        });

        $merged = $flatContent->merge($flatCategoryQuestions);

        return $merged->map(function ($value, $key) use ($converter) {
            $html = '<h3 class="mt-6">['.Str::headline($key).']</h3>'
                .nl2br(trim($value)).'<br /><br />';

            return $converter->convert($html);
        })->implode("\n\n");
    }

    protected function processTags($groupTags)
    {
        $connection = DB::connection('pgsql');

        $tagIds = collect($groupTags)->map(function ($tag) use ($connection) {
            $slug = Str::slug($tag);

            $connection->table('tags')->updateOrInsert(
                ['slug' => $slug],
                [
                    'title' => ucfirst($tag),
                    'meta_title' => ucfirst($tag),
                ]
            );

            // Fetch tag ID
            return $connection->table('tags')
                ->where('slug', $slug)
                ->value('id');
        })->filter();

        foreach ($tagIds as $tagId) {
            DB::connection('pgsql')->table('model_tag')->updateOrInsert(
                [
                    'model_id' => $this->proposalId,
                    'tag_id' => $tagId,
                    'model_type' => 'App\\Models\\Proposal',
                ],
            );
        }
    }

    protected function processMetas($project_length, $applicant_type, $opensource)
    {

        $connection = DB::connection('pgsql');
        $modelType = 'App\\Models\\Proposal';

        $metaItems = [
            ['key' => 'project_length', 'content' => $project_length],
            ['key' => 'applicant_type', 'content' => $applicant_type],
            ['key' => 'opensource', 'content' => $opensource],
        ];

        foreach ($metaItems as $meta) {
            $connection->table('metas')->updateOrInsert(
                [
                    'model_id' => $this->proposalId,
                    'key' => $meta['key'],
                    'model_type' => $modelType,
                ],
                [
                    'content' => $meta['content'],
                ]
            );
        }
    }

    protected function processPrimaryAuthor($data)
    {
        $connection = DB::connection('pgsql');

        $connection->table('catalyst_profiles')->updateOrInsert(
            [
                'name' => $data->applicant,
            ],
            [
                'username' => Str::slug($data->applicant),
                'name' => $data->applicant,
            ]
        );

        $profileId = $connection->table('catalyst_profiles')
            ->where('username', $data->applicant)
            ->value('id');

        if ($profileId && $this->proposalId) {
            $connection->table('proposal_profiles')->updateOrInsert(
                [
                    'profile_id' => $profileId,
                    'proposal_id' => $this->proposalId,
                    'profile_type' => CatalystProfile::class,
                ]
            );
        }
    }
}
