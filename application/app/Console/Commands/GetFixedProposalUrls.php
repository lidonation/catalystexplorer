<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Proposal;
use Illuminate\Console\Command;

class GetFixedProposalUrls extends Command
{
    protected $signature = 'proposals:get-fixed-urls';

    protected $description = 'Get URLs for the recently fixed proposals';

    public function handle()
    {
        $fixedTitles = [
            'Coxylib.js - Simplifying Cardano DApp Development',
            'ModelTrust: Decentralized AI Model Verification Framework',
            'Empowering Community Hub Cardano in Brazil',
            'AI Insights: Blockchain Based AI Analytics Platform',
            'cPoker Development',
            'Cardano DevTrack: A Cardano Development and Tooling Platform',
            'Crypto Law Education for Lawyers',
            'AI-Cardano-Bridge',
            'OctoWars - a TCG game',
            'Learning Midnight and Hydra through a game',
            'Cardano Warriors: Driving Cardano Adoption via Epic Games',
            'Arvo: Fair Funding Launchpad for Independent Projects',
            'Project Catalyst dRep Analysis Framework',
            '[FIMI] Bring Cardano Videos to Vietnamese',
            'Dairy Supply Chain Transparency Platform',
            'TrialNet: Open Source Clinical Trials Powered by Aiken',
            'Midnight and Atala Prism Enabled Medical DID',
            'Hydra Minecraft',
            'Cardano SDK for Mobile dApp Development',
            'AI-Powered Cardano Ecosystem Dashboard',
            'Open Source Educational Reforestation Game',
            '[FIMI] Podcast Cardano on Telegram for Vietnamese',
            'Cardano Component UI Library [by Lido Nation]',
            'Gimbalabs - Regional Cardano Student Society Playbook',
            'Koios C++ Client Library',
        ];

        $this->info("URLs for the 25 Fixed Proposals:\n");

        $count = 0;
        foreach ($fixedTitles as $title) {
            $proposal = Proposal::where('title', $title)->first();

            if ($proposal) {
                $count++;
                $this->line("{$count}. Title: {$proposal->title}");
                $this->line("   URL: https://catalystexplorer.com/proposals/{$proposal->hash_id}");
                $this->line('   Ideascale: '.($proposal->ideascale_link ?: 'N/A'));
                $this->newLine();
            } else {
                $this->warn("Could not find proposal: {$title}");
            }
        }

        $this->info("Total found: {$count} proposals");

        return Command::SUCCESS;
    }
}
