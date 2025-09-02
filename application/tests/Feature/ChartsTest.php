<?php

declare(strict_types=1);

use App\Models\Fund;
use App\Models\Proposal;
use App\Models\User;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('renders charts modal successfully', function () {
    $this->get(route('charts.proposals'))
        ->assertStatus(200)
        ->assertInertia(
            fn(Assert $page) =>
            $page->component('Proposals/Index')
                ->has('_inertiaui_modal')
                ->where('_inertiaui_modal.component', 'Charts/Index')
                ->has('_inertiaui_modal.props.slideover')
                ->where('_inertiaui_modal.props.slideover', true)
        );
});

it('passes correct props to charts component', function () {
    $fund = Fund::factory()->create(['title' => 'Fund 10']);

    Proposal::factory()->create([
        'fund_id' => $fund->id,
        'funding_status' => ProposalFundingStatus::funded()->value,
        'status' => ProposalStatus::complete()->value,
    ]);

    $this->get(route('charts.proposals'))->assertInertia(
        fn(Assert $page) =>
        $page->component('Proposals/Index')
            ->has('_inertiaui_modal.props.filters')
            ->has('_inertiaui_modal.props.chartDataByFund')
            ->has('_inertiaui_modal.props.chartDataByYear')
            ->has('_inertiaui_modal.props.slideover')
            ->where('_inertiaui_modal.props.slideover', true)
    );
});

it('does not require authentication to access charts', function () {
    $this->get(route('charts.proposals'))->assertStatus(200);
});

it('returns chart data by fund with correct structure', function () {
    $fund1 = Fund::factory()->create(['title' => 'Fund 10']);
    $fund2 = Fund::factory()->create(['title' => 'Fund 11']);

    Proposal::factory()->create([
        'fund_id' => $fund1->id,
        'funding_status' => ProposalFundingStatus::funded()->value,
        'status' => ProposalStatus::complete()->value,
    ]);

    $this->get(route('charts.proposals'))->assertInertia(
        fn(Assert $page) =>
        $page->component('Proposals/Index')
            ->has('_inertiaui_modal.props.chartDataByFund')
            ->has(
                '_inertiaui_modal.props.chartDataByFund.0',
                fn(Assert $item) =>
                $item->has('fund')
                    ->has('totalProposals')
                    ->has('fundedProposals')
                    ->has('completedProposals')
            )
    );
});

it('returns chart data by year with correct structure', function () {
    Proposal::factory()->create([
        'created_at' => now(),
        'funding_status' => ProposalFundingStatus::funded()->value,
        'status' => ProposalStatus::complete()->value,
    ]);

    $this->get(route('charts.proposals'))->assertInertia(
        fn(Assert $page) =>
        $page->component('Proposals/Index')
            ->has('_inertiaui_modal.props.chartDataByYear')
            ->has(
                '_inertiaui_modal.props.chartDataByYear.0',
                fn(Assert $item) =>
                $item->has('year')
                    ->has('totalProposals')
                    ->has('fundedProposals')
                    ->has('completedProposals')
            )
    );
});

it('sorts fund data by fund number', function () {
    Fund::factory()->create(['title' => 'Fund 12']);
    Fund::factory()->create(['title' => 'Fund 10']);
    Fund::factory()->create(['title' => 'Fund 11']);

    $this->get(route('charts.proposals'))->assertInertia(
        fn(Assert $page) =>
        $page->component('Proposals/Index')
            ->has('_inertiaui_modal.props.chartDataByFund')
            ->where('_inertiaui_modal.props.chartDataByFund.0.fund', 'Fund 2')
            ->where('_inertiaui_modal.props.chartDataByFund.1.fund', 'Fund 3')
            ->where('_inertiaui_modal.props.chartDataByFund.2.fund', 'Fund 4')
    );
});

it('sorts year data chronologically', function () {
    Proposal::factory()->create(['created_at' => '2023-01-01']);
    Proposal::factory()->create(['created_at' => '2022-01-01']);
    Proposal::factory()->create(['created_at' => '2024-01-01']);

    $this->get(route('charts.proposals'))->assertInertia(
        fn(Assert $page) =>
        $page->component('Proposals/Index')
            ->has('_inertiaui_modal.props.chartDataByYear')
            ->where('_inertiaui_modal.props.chartDataByYear.0.year', 2020)
            ->where('_inertiaui_modal.props.chartDataByYear.1.year', 2021)
            ->where('_inertiaui_modal.props.chartDataByYear.2.year', 2022)
    );
});


it('handles empty data gracefully', function () {
    $this->get(route('charts.proposals'))->assertInertia(
        fn(Assert $page) =>
        $page->component('Proposals/Index')
            ->has('_inertiaui_modal.props.chartDataByFund')
            ->has('_inertiaui_modal.props.chartDataByYear')
            ->where('_inertiaui_modal.props.chartDataByFund.0.totalProposals', 0)
            ->where('_inertiaui_modal.props.chartDataByFund.0.fund', 'Fund 2')
    );
});
