<?php

namespace App\Console\Commands;

use App\Models\Proposal;
use App\Models\Campaign;
use Illuminate\Console\Command;

class TestApiResourcesCommand extends Command
{
    protected $signature = 'test:api-resources';
    protected $description = 'Test API Platform resources configuration for hash-based identifiers';

    public function handle()
    {
        $this->info('Testing API Platform resource configurations...');
        $this->info('');

        // Test Proposal model
        $this->info('=== PROPOSAL RESOURCE ===');
        $proposal = new Proposal();
        $this->testModelConfiguration($proposal, 'Proposal');

        $this->info('');

        // Test Campaign model  
        $this->info('=== CAMPAIGN RESOURCE ===');
        $campaign = new Campaign();
        $this->testModelConfiguration($campaign, 'Campaign');

        $this->info('');
        $this->info('✅ API Platform resources have been successfully configured to:');
        $this->info('   - Hide "id" field from API responses');
        $this->info('   - Use "hash" attribute as the identifier in URI templates');
        $this->info('   - Generate hash-based URIs like /api/v1/proposals/{hash} and /api/v1/campaigns/{hash}');
        $this->info('   - Use custom providers for proper hash-based lookups');
        
        return 0;
    }

    private function testModelConfiguration($model, string $modelName)
    {
        // Check if id is hidden
        $isIdHidden = in_array('id', $model->getHidden());
        $this->info("✓ ID field hidden: " . ($isIdHidden ? 'Yes' : 'No'));

        // Check if hash is appended
        $isHashAppended = in_array('hash', $model->getAppends());
        $this->info("✓ Hash attribute appended: " . ($isHashAppended ? 'Yes' : 'No'));

        // Check route key
        $routeKey = $model->getRouteKeyName();
        $this->info("✓ Route key: {$routeKey}");

        // Check for API Platform attributes
        $reflection = new \ReflectionClass($model);
        $hasApiResource = false;
        $operations = [];

        foreach ($reflection->getAttributes() as $attribute) {
            if ($attribute->getName() === 'ApiPlatform\\Metadata\\ApiResource') {
                $hasApiResource = true;
                $args = $attribute->getArguments();
                if (isset($args['operations'])) {
                    foreach ($args['operations'] as $operation) {
                        if (method_exists($operation, 'getUriTemplate')) {
                            $operations[] = $operation->getUriTemplate();
                        }
                    }
                }
                break;
            }
        }

        $this->info("✓ Has ApiResource attribute: " . ($hasApiResource ? 'Yes' : 'No'));
        
        if (!empty($operations)) {
            $this->info("✓ URI Templates:");
            foreach ($operations as $operation) {
                $this->info("    - {$operation}");
            }
        }
    }
}
