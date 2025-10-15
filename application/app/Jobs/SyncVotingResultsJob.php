<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\CatalystFunds;
use App\Models\Proposal;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncVotingResultsJob implements ShouldQueue
{
    use Dispatchable, GetImageLink, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
    ) {}

    /**
     * @throws ConnectionException
     */
    public function handle(): void
    {
        $funds = [
            'cardano-open-developers' => 'cardano-open-developers-f14',
            'cardano-open-ecosystem' => 'cardano-open-ecosystem-f14',
            'cardano-use-cases-concepts' => 'cardano-use-case-concept-f14',
            'cardano-use-cases-partners-and-products' => 'cardano-use-case-partners-and-products-f14',
            'sponsored-by-leftovers' => null,
        ];

        $fundNum = '14';
        $fundId = CatalystFunds::FOURTEEN->value;

        foreach ($funds as $key => $challenge) {
            $res = Http::post(
                'https://projectcatalyst.io/api/v1/graphql',
                [
                    'query' => '
                      query {
                        challenge(input: {slug: "'.$key.'"}, fundId: "'.strval($fundNum).'") {
                          _id
                          fundId
                          name
                          slug
                          fundsAvailable {
                            amount
                            code
                            exp
                          }
                          projects (includeUnfunded: true, excludeLeftovers: false) {
                            _fundingId
                            fundId
                            projectName
                            projectSlug
                            projectStatus
                            completed {
                              date
                              videoUrl
                            }
                            challenge {
                              fundId
                              slug
                            }
                            funding {
                              distributedToDate {
                                amount
                                code
                                exp
                              }
                              remaining {
                                amount
                                code
                                exp
                              }
                              requested {
                                amount
                                code
                                exp
                              }
                            }
                            voting {
                              status
                              reasonForNotFundedStatus
                              meetsApprovalThreshold
                              votesCast
                              yes {
                                amount
                                code
                                exp
                              }
                              no {
                                amount
                                code
                                exp
                              }
                              abstain {
                                amount
                                code
                                exp
                              }
                              fundDepletion {
                                amount
                                code
                                exp
                              }
                            }
                            leftoverVoting {
                              status
                              reasonForNotFundedStatus
                              meetsApprovalThreshold
                              votesCast
                              yes {
                                amount
                                code
                                exp
                              }
                              no {
                                amount
                                code
                                exp
                              }
                              fundDepletion {
                                amount
                                code
                                exp
                              }
                            }
                          }
                        }
                      }
                    ',
                ]
            );

            if ($res->successful()) {
                $projects = $res->json()['data']['challenge']['projects'];

                foreach ($projects as $project) {
                    $slug = Str::limit(Str::slug($project['projectName']), 150, '')."-f{$fundNum}";

                    $p = Proposal::where('fund_id', $fundId)
                        ->where('slug', $slug)
                        ->first();

                    if (! $p instanceof Proposal) {
                        Log::info('failed to sync '.$project['projectName']);

                        continue;
                    }

                    if (! isset($project['voting'])) {
                        Log::info('voting data missing for'.$project['projectName']);

                        continue;
                    }

                    $votingData = $project['voting'];

                    if ($votingData['yes'] == null) {
                        Log::info('voting data missing for'.$project['projectName']);

                        continue;
                    }

                    $p->yes_votes_count = $votingData['yes']['amount'] / 1000000;
                    $p->abstain_votes_count = $votingData['abstain']['amount'] / 1000000;
                    if ($votingData['status'] == 'Funded') {
                        $p->funding_status = 'funded';
                    } else {
                        if ((bool) $votingData['meetsApprovalThreshold']) {
                            $p->funding_status = 'over_budget';
                        } else {
                            $p->funding_status = 'not_approved';
                        }
                    }
                    //                    $p->funding_status = match ($votingData['reasonForNotFundedStatus']) {
                    //                        'Not Funded - Over Budget' => 'over_budget',
                    //                        'Not Funded - Approval Threshold' => 'not_approved',
                    //                        default => 'funded'
                    //                    };

                    if ($p->funding_status === 'funded') {
                        $p->funded_at = now();
                        if (! $challenge) {
                            $p->funding_status = 'leftover';
                        }
                    }
                    $p->status = match ($p->funding_status) {
                        'funded' => 'in_progress',
                        'leftover' => 'in_progress',
                        default => 'unfunded'
                    };
                    $p->save();
                    $p->saveMeta('unique_wallets', $votingData['votesCast']);
                    $p->saveMeta('funds_remaining', $votingData['fundDepletion']['amount'] / 1000000);
                }
            }
        }
    }
}
