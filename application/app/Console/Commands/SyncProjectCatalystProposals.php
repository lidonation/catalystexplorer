<?php

namespace App\Console\Commands;

use App\Invokables\DecodeCatalystDocument;
use App\Jobs\SyncProposalsJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use JetBrains\PhpStorm\NoReturn;
use Symfony\Component\Console\Input\InputArgument;

class SyncProjectCatalystProposals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $name = 'cx:sync-project-catalyst-proposals';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Fund proposals from projectcatalyst.io';

    #[NoReturn]
    public function handle(): void
    {
        $page = 0;

        do {
            $response = Http::withHeaders([])
                ->post(
                    "https://app.projectcatalyst.io/api/gateway/v1/document/index?page={$page}&limit=100",
                    (object) ['type' => '7808d2ba-d511-40af-84e8-c0d1625fdfdc']
                );

            $body = $response->json();
            $ids = array_column($body['docs'] ?? [], 'id');

            foreach ($ids as $id) {
                $url = "https://app.projectcatalyst.io/api/gateway/v1/document/{$id}";
                $response = Http::withHeaders([])->get($url);

                if (! $response->successful()) {
                    Log::error("Failed to fetch document: {$id} — HTTP ".$response->status());

                    continue;
                }

                $binary = $response->body();

                $decoded = (new DecodeCatalystDocument)($binary);

                if (isset($decoded['payload']['setup'])) {
                    SyncProposalsJob::dispatch($decoded, $this->argument('fund'));
                }
            }
        } while (! empty($ids));

    }

    protected function getArguments(): array
    {
        return [
            ['fund', InputArgument::REQUIRED, 'fund to process', null],
        ];
    }
}
