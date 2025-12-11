<?php

declare(strict_types=1);

namespace App\Http\Integrations\ProjectCatalyst\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class GetChallengeVotingDataRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    public function __construct(
        protected string $challengeSlug,
        protected string $fundNumber
    ) {}

    public function resolveEndpoint(): string
    {
        return '/graphql';
    }

    protected function defaultBody(): array
    {
        return [
            'query' => $this->buildGraphQLQuery(),
        ];
    }

    protected function buildGraphQLQuery(): string
    {
        return '
            query {
                challenge(input: {slug: "'.$this->challengeSlug.'"}, fundId: "'.$this->fundNumber.'") {
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
        ';
    }
}
