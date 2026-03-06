<?php

declare(strict_types=1);

namespace App\Tools;

use App\Actions\Ai\ExtractProposalField;
use App\Actions\Ai\ExtractProposalTitle;
use App\Models\Proposal;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class ProposalDetailsTool implements ToolInterface
{
    public function definition(): array
    {
        return [
            'name' => 'get_proposal_details',
            'description' => 'Get detailed information about a specific Project Catalyst proposal by ID.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'proposal_id' => [
                        'type' => 'string',
                        'description' => 'The ID of the proposal to get details for',
                    ],
                ],
                'required' => ['proposal_id'],
            ],
        ];
    }

    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        $proposalId = $arguments['proposal_id'];

        try {
            $proposal = Proposal::with(['fund', 'campaign', 'team.model', 'discussions'])
                ->find($proposalId);

            if (! $proposal) {
                return "Sorry, I couldn't find a proposal with ID: {$proposalId}. Please check the ID and try again.";
            }

            return $this->formatProposalDetails($proposal);

        } catch (\Exception $e) {
            return 'Sorry, I encountered an error while getting proposal details: '.$e->getMessage();
        }
    }

    private function formatProposalDetails(Proposal $proposal): string
    {
        $extractTitle = new ExtractProposalTitle;
        $extractField = new ExtractProposalField;

        $title = $extractTitle($proposal);

        // Basic information
        $details = '## 📊 Basic Informationn'."\n";
        $details .= "- **ID**: {$proposal->id}\n";
        $details .= '- **Fund**: '.($proposal->fund?->title ?? 'Unknown')."\n";
        $details .= '- **Campaign**: '.($proposal->campaign?->title ?? 'General')."\n";
        $details .= "- **Amount Requested**: {$proposal->amount_requested} {$proposal->currency}\n";
        $details .= '- **Status**: '.($proposal->funded_at ? '✅ FUNDED' : '⏳ Not Funded')."\n";

        if ($proposal->funded_at) {
            $details .= '- **Funded Date**: '.$proposal->funded_at->format('M j, Y')."\n";
            if ($proposal->amount_received) {
                $details .= "- **Amount Received**: {$proposal->amount_received} {$proposal->currency}\n";
            }
        }

        $details .= '- **Created**: '.$proposal->created_at->format('M j, Y')."\n";
        $details .= "- **View Online**: {$proposal->link}\n\n";

        // Problem statement
        if ($problem = $extractField($proposal, 'problem')) {
            $details .= "## 🔍 Problem Statement\n{$problem}\n\n";
        }

        // Proposed solution
        if ($solution = $extractField($proposal, 'solution')) {
            $details .= "## 💡 Proposed Solution\n{$solution}\n\n";
        }

        // Experience and team
        if ($experience = $extractField($proposal, 'experience')) {
            $details .= "## 👥 Team & Experience\n{$experience}\n\n";
        }

        // Team members
        if ($proposal->team && $proposal->team->count() > 0) {
            $details .= "## 🤝 Team Members\n";
            foreach ($proposal->team as $member) {
                if ($member->model) {
                    $details .= "- **{$member->model->name}**";
                    if ($member->model->username) {
                        $details .= " (@{$member->model->username})";
                    }
                    $details .= "\n";
                }
            }
            $details .= "\n";
        }

        // Additional details
        if ($content = $extractField($proposal, 'content')) {
            $details .= "## 📝 Additional Details\n{$content}\n\n";
        }

        // Project metrics (if available)
        if ($proposal->project_length) {
            $details .= "## ⏱️ Project Metrics\n";
            $details .= "- **Project Length**: {$proposal->project_length} months\n";
            if ($proposal->opensource !== null) {
                $details .= '- **Open Source**: '.($proposal->opensource ? 'Yes' : 'No')."\n";
            }
            $details .= "\n";
        }

        // Voting information (if available)
        if ($proposal->votes_cast) {
            $details .= "## 🗳️ Voting Results\n";
            $details .= '- **Total Votes Cast**: '.number_format($proposal->votes_cast)."\n";
            if ($proposal->yes_wallets) {
                $details .= '- **Yes Votes**: '.number_format($proposal->yes_wallets)." wallets\n";
            }
            if ($proposal->no_wallets) {
                $details .= '- **No Votes**: '.number_format($proposal->no_wallets)." wallets\n";
            }
            $details .= "\n";
        }

        // Assessment scores (if available)
        $hasScores = $proposal->alignment_score || $proposal->feasibility_score || $proposal->auditability_score;
        if ($hasScores) {
            $details .= "## 📈 Community Assessment Scores\n";
            if ($proposal->alignment_score) {
                $details .= "- **Impact/Alignment**: {$proposal->alignment_score}/5.0\n";
            }
            if ($proposal->feasibility_score) {
                $details .= "- **Feasibility**: {$proposal->feasibility_score}/5.0\n";
            }
            if ($proposal->auditability_score) {
                $details .= "- **Auditability**: {$proposal->auditability_score}/5.0\n";
            }
            $details .= "\n";
        }

        $details .= '💡 **Need more information?** Ask me specific questions about this proposal or search for similar ones!';

        return $details;
    }
}
