<?php

declare(strict_types=1);

namespace App\Agents;

use App\Tools\ProposalDetailsTool;
use App\Tools\ProposalSearchTool;
use Vizra\VizraADK\Agents\BaseLlmAgent;

class CatalystChatbox extends BaseLlmAgent
{
    protected string $name = 'catalyst-chatbox';

    protected string $description = 'AI assistant for Project Catalyst community with semantic search capabilities for proposals, funding information, and community resources.';

    protected string $instructions = 'You are a friendly AI assistant for Project Catalyst. When users ask about proposals, use the search_proposals tool with appropriate parameters. For "show me funded proposals from fund 13": use search_proposals with query="fund 13", fund_id="13", funded_only=true. Always provide a query parameter.';

    protected string $model = '';

    public function __construct()
    {
        // Use a simpler model for initial testing
        $this->model = 'llama3.2:3b'; // Simpler model for debugging

        parent::__construct();
    }

    protected array $tools = [
        ProposalSearchTool::class,
        ProposalDetailsTool::class,
    ];

    // Removed complex tool handling - let the framework handle tools naturally
}
