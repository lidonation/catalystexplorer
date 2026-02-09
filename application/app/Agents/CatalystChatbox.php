<?php

declare(strict_types=1);

namespace App\Agents;

use App\Tools\ProposalDetailsTool;
use App\Tools\ProposalSearchTool;
use Vizra\VizraADK\Agents\BaseLlmAgent;
use Vizra\VizraADK\System\AgentContext;

class CatalystChatbox extends BaseLlmAgent
{
    protected string $name = 'catalyst-chatbox';

    protected string $description = 'AI assistant for Project Catalyst community with semantic search capabilities for proposals, funding information, and community resources.';

    protected string $instructions = 'You are a friendly AI assistant for Project Catalyst. Answer conversational queries naturally. Only use search tools when users specifically ask about proposals, projects, or funding examples. For greetings and general questions, respond normally without tools.';

    protected string $model = '';

    public function __construct()
    {
        // Use a more capable model for better tool calling and conversation
        $this->model = 'llama3.2:3b'; // More capable than 1b but still reasonably fast

        parent::__construct();
    }

    protected array $tools = [
        ProposalSearchTool::class,
        ProposalDetailsTool::class,
    ];

    /*
    // Temporarily disabled to isolate issue
    public function beforeLlmCall(array $inputMessages, AgentContext $context): array
    {
        // Check if the user's message seems to be asking about proposals
        $lastUserMessage = '';
        for ($i = count($inputMessages) - 1; $i >= 0; $i--) {
            $message = $inputMessages[$i];
            // Handle both array and object formats
            if (is_array($message) && isset($message['role']) && $message['role'] === 'user') {
                $lastUserMessage = strtolower($message['content'] ?? '');
                break;
            } elseif (is_object($message) && method_exists($message, 'role') && $message->role === 'user') {
                $lastUserMessage = strtolower($message->content ?? '');
                break;
            }
        }

        // More specific keywords that clearly indicate proposal queries
        $proposalKeywords = [
            'proposal', 'project about', 'funding', 'funded project', 'grant',
            'show me proposal', 'find proposal', 'search proposal', 'proposal example',
            'what proposals exist', 'proposals about', 'catalyst project',
            'ai proposal', 'defi proposal', 'education proposal'
        ];

        // More specific patterns that indicate proposal searches
        $proposalPatterns = [
            '/show me.*proposal/',
            '/find.*proposal/',
            '/proposals? (about|on|for)/',
            '/what.*proposals?.*exist/',
            '/catalyst.*project/',
            '/project catalyst/',
        ];

        $needsTools = false;

        // Check keywords
        foreach ($proposalKeywords as $keyword) {
            if (strpos($lastUserMessage, $keyword) !== false) {
                $needsTools = true;
                break;
            }
        }

        // Check patterns if keywords didn't match
        if (!$needsTools) {
            foreach ($proposalPatterns as $pattern) {
                if (preg_match($pattern, $lastUserMessage)) {
                    $needsTools = true;
                    break;
                }
            }
        }

        if ($needsTools) {
            $toolInstructions = [
                'role' => 'system',
                'content' => '🚨 This query appears to be about Project Catalyst proposals. You MUST:\n' .
                    '1. Use search_proposals tool with appropriate keywords from the user query\n' .
                    '2. Base your answer ONLY on tool results\n' .
                    '3. Do not use training data for proposal examples\n' .
                    '4. If no results found, say "I searched but found no proposals matching your query"'
            ];
            $inputMessages[] = $toolInstructions;
        }

        return parent::beforeLlmCall($inputMessages, $context);
    }
    */
}
