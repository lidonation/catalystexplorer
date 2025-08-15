<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Models\BookmarkCollection;
use App\Models\Community;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Meta;
use App\Models\Proposal;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;

class PublishToIpfsController extends Controller
{
    // Workflow methods
    public function handleStep(Request $request, $step): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {

            $reflection = new ReflectionMethod($this, $method);
            $parametersCount = $reflection->getNumberOfParameters();

            if ($parametersCount > 0) {
                return $this->{$method}($request);
            }

            return $this->{$method}();
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {
        $validated = $request->validate([
            'bookmarkHash' => 'nullable|string',
        ]);

        return Inertia::render('Workflows/PublishToIpfs/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 1,
            'bookmarkHash' => $validated['bookmarkHash'] ?? null,
        ]);
    }

    public function step2(Request $request): Response
    {
        $validated = $request->validate([
            'bookmarkHash' => 'nullable|string',
            'type' => 'nullable|string|in:proposals,communities,groups,ideascaleProfiles,reviews',
        ]);

        $bookmarkCollection = null;
        $currentType = $validated['type'] ?? 'proposals';

        if ($request->has('type')) {
            $currentPage = 1;
        } else {
            $currentPage = (int) $request->input(ProposalSearchParams::PAGE()->value, 1);
        }

        if (! empty($validated['bookmarkHash'])) {
            $bookmarkCollection = BookmarkCollection::find($validated['bookmarkHash']);
            if (! $bookmarkCollection) {
                abort(404, 'Bookmark collection not found');
            }
        }

        $filters = [];

        if ($request->has(ProposalSearchParams::QUERY()->value)) {
            $filters[ProposalSearchParams::QUERY()->value] = $request->input(ProposalSearchParams::QUERY()->value);
        }

        if ($request->has(ProposalSearchParams::SORTS()->value)) {
            $filters[ProposalSearchParams::SORTS()->value] = $request->input(ProposalSearchParams::SORTS()->value);
        }

        if ($request->has(ProposalSearchParams::PAGE()->value)) {
            $filters[ProposalSearchParams::PAGE()->value] = $currentPage;
        }

        if ($request->has(ProposalSearchParams::LIMIT()->value)) {
            $filters[ProposalSearchParams::LIMIT()->value] = $request->input(ProposalSearchParams::LIMIT()->value);
        }

        if ($request->has(QueryParamsEnum::BOOKMARK_COLLECTION()->value)) {
            $filters[QueryParamsEnum::BOOKMARK_COLLECTION()->value] = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);
        }

        if (! empty($validated['bookmarkHash'])) {
            $filters['bookmarkHash'] = $validated['bookmarkHash'];
        }

        $props = [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 2,
            'bookmarkHash' => $validated['bookmarkHash'] ?? null,
            'bookmarkCollection' => $bookmarkCollection ? \App\DataTransferObjects\BookmarkCollectionData::from($bookmarkCollection) : null,
            'type' => $currentType,
            'filters' => $filters,
        ];

        if ($bookmarkCollection) {
            $props = array_merge($props, $this->getBookmarkItemsByType($bookmarkCollection, $request, $currentPage));
        }

        return Inertia::render('Workflows/PublishToIpfs/Step2', $props);
    }

    public function publishListToIpfs(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'publishSettings' => 'required|string|in:public,private',
            'includeMetadata' => 'boolean',
            'bookmarkHash' => 'required|string',
        ]);

        try {
            $bookmarkCollection = BookmarkCollection::find($validated['bookmarkHash']);

            if (! $bookmarkCollection) {
                return back()->withErrors(['error' => 'Bookmark collection not found.']);
            }

            if ($bookmarkCollection->user_id !== auth()->id()) {
                return back()->withErrors(['error' => 'You do not have permission to publish this collection.']);
            }

            if ($bookmarkCollection->proposals_count === 0) {
                return back()->withErrors(['error' => 'Cannot publish collection with no proposals.']);
            }

            $jsonLdData = $this->generateBallotJsonLd($bookmarkCollection);

            $filename = "ballot-{$bookmarkCollection->hash}.json";
            $cid = $bookmarkCollection->uploadToIpfs(json_encode($jsonLdData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), $filename);
            $gatewayUrl = $bookmarkCollection->getIpfsUrl($cid);

            $bookmarkCollection->pinToIpfs($cid);

            Meta::where('model_type', BookmarkCollection::class)
                ->where('model_id', $bookmarkCollection->id)
                ->where('key', 'ipfs_cid')
                ->delete();

            Meta::create([
                'model_type' => BookmarkCollection::class,
                'model_id' => $bookmarkCollection->id,
                'key' => 'ipfs_cid',
                'content' => $cid,
            ]);

            $ipfsResult = [
                'cid' => $cid,
                'gateway_url' => $gatewayUrl,
                'filename' => $filename,
            ];

            return redirect()->route('workflows.publishToIpfs.success', [
                'ipfs_cid' => $ipfsResult['cid'],
                'gateway_url' => $ipfsResult['gateway_url'],
                'filename' => $ipfsResult['filename'],
                'bookmarkHash' => $validated['bookmarkHash'],
            ]);

        } catch (\Exception $e) {

            return back()->withErrors(['error' => 'Failed to publish to IPFS: '.$e->getMessage()]);
        }
    }

    public function success(Request $request): Response
    {
        $validated = $request->validate([
            'ipfs_cid' => 'required|string',
            'gateway_url' => 'required|url',
        ]);

        return Inertia::render('Workflows/PublishToIpfs/Success', [
            'ipfs_cid' => $validated['ipfs_cid'],
            'gateway_url' => $validated['gateway_url'],
        ]);
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.publishToIpfs.stepDetails.introduction',
            ],
            [
                'title' => 'workflows.publishToIpfs.stepDetails.reviewList',
            ],
        ]);
    }

    protected function getBookmarkItemsByType(BookmarkCollection $bookmarkCollection, Request $request, int $currentPage = 1): array
    {

        $modelTypes = [
            'proposals' => Proposal::class,
            'communities' => Community::class,
            'groups' => Group::class,
            'ideascaleProfiles' => IdeascaleProfile::class,
            'reviews' => Review::class,
        ];

        $relationshipsMap = [
            Proposal::class => ['users', 'fund', 'campaign'],
            Group::class => ['ideascale_profiles'],
            Community::class => ['ideascale_profiles'],
            IdeascaleProfile::class => [],
            Review::class => ['proposal', 'user'],
        ];

        $countMap = [
            Group::class => ['reviews', 'proposals', 'funded_proposals'],
            Community::class => ['ideascale_profiles', 'proposals'],
            Proposal::class => [],
            IdeascaleProfile::class => [],
            Review::class => [],
        ];

        $result = [];

        foreach ($modelTypes as $type => $modelClass) {

            $bookmarkItemIds = $bookmarkCollection->items
                ->where('model_type', $modelClass)
                ->pluck('model_id')
                ->toArray();

            if (empty($bookmarkItemIds)) {

                $result[$type] = [
                    'data' => [],
                    'current_page' => $currentPage,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'from' => null,
                    'to' => null,
                ];

                continue;
            }

            $relationships = $relationshipsMap[$modelClass] ?? [];
            $counts = $countMap[$modelClass] ?? [];

            $query = $modelClass::query()
                ->whereIn('id', $bookmarkItemIds);

            if (! empty($relationships)) {
                $query->with($relationships);
            }

            if (! empty($counts)) {
                $query->withCount($counts);
            }

            $data = $query->paginate(10, ['*'], ProposalSearchParams::PAGE()->value, $currentPage);

            $dtoData = $modelClass::toDtoPaginated($data);

            $paginatorResult = to_length_aware_paginator($dtoData);

            $result[$type] = $paginatorResult->toArray();

        }

        return $result;
    }

    /**
     * Generat JSON-LD ballot data for IPFS upload
     */
    private function generateBallotJsonLd(BookmarkCollection $bookmarkCollection): array
    {

        $proposalIds = $bookmarkCollection->items
            ->where('model_type', Proposal::class)
            ->pluck('model_id')
            ->toArray();

        $proposals = Proposal::query()
            ->whereIn('id', $proposalIds)
            ->get();

        $rationale = null;
        $rationaleRecord = Meta::where('model_type', BookmarkCollection::class)
            ->where('model_id', $bookmarkCollection->id)
            ->where('key', 'rationale')
            ->first();

        if ($rationaleRecord) {
            $rationale = $rationaleRecord->content;
        }

        return [
            '@context' => [
                'CIP100' => 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#',
                'CIP108' => 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0108/README.md#',
                'hashAlgorithm' => 'CIP100:hashAlgorithm',
                'authors' => [
                    '@container' => '@set',
                    '@context' => [
                        'name' => 'http://xmlns.com/foaf/0.1/name',
                        'witness' => [
                            '@context' => [
                                'publicKey' => 'CIP100:publicKey',
                                'signature' => 'CIP100:signature',
                                'witnessAlgorithm' => 'CIP100:witnessAlgorithm',
                            ],
                            '@id' => 'CIP100:witness',
                        ],
                    ],
                    '@id' => 'CIP100:authors',
                ],
                'body' => [
                    '@context' => [
                        'abstract' => 'CIP108:abstract',
                        'motivation' => 'CIP108:motivation',
                        'rationale' => 'CIP108:rationale',
                        'references' => [
                            '@container' => '@set',
                            '@context' => [
                                'GovernanceMetadata' => 'CIP100:GovernanceMetadataReference',
                                'Other' => 'CIP100:OtherReference',
                                'label' => 'CIP100:reference-label',
                                'referenceHash' => [
                                    '@context' => [
                                        'hashAlgorithm' => 'CIP100:hashAlgorithm',
                                        'hashDigest' => 'CIP108:hashDigest',
                                    ],
                                    '@id' => 'CIP108:referenceHash',
                                ],
                                'uri' => 'CIP100:reference-uri',
                            ],
                            '@id' => 'CIP108:references',
                        ],
                        'title' => 'CIP108:title',
                    ],
                    '@id' => 'CIP108:body',
                ],
                'bookmark' => 'https://schema.org/BookmarkAction',
                'list' => 'https://schema.org/Collection',
                'url' => 'https://schema.org/url',
                'title' => 'https://schema.org/name',
                'description' => 'https://schema.org/description',
                'dateCreated' => 'https://schema.org/dateCreated',
                'dateModified' => 'https://schema.org/dateModified',
                'items' => [
                    '@id' => 'https://schema.org/hasPart',
                    '@container' => '@set',
                    '@context' => [
                        'actionStatus' => 'https://schema.org/actionStatus',
                        'object' => [
                            '@id' => 'https://schema.org/object',
                            '@context' => [
                                'url' => 'https://schema.org/url',
                                'proposalId' => 'https://schema.org/identifier',
                                'fundingRequested' => 'https://schema.org/MonetaryAmount',
                                'currency' => 'https://schema.org/currency',
                                'fund' => 'https://schema.org/isPartOf',
                            ],
                        ],
                    ],
                ],
            ],
            'authors' => [],
            'hashAlgorithm' => 'blake2b-256',
            'body' => [
                'title' => $bookmarkCollection->title,
                'abstract' => $bookmarkCollection->content,
                'motivation' => '',
                'rationale' => $rationale,
                'references' => [],
            ],
            '@type' => 'list',
            'title' => $bookmarkCollection->title,
            'description' => $bookmarkCollection->content,
            'dateCreated' => $bookmarkCollection->created_at->toISOString(),
            'dateModified' => $bookmarkCollection->updated_at->toISOString(),
            'items' => $proposals->map(function ($proposal) {
                return [
                    '@type' => 'bookmark',
                    'actionStatus' => 'https://schema.org/CompletedActionStatus',
                    'title' => $proposal->title,
                    'object' => [
                        '@type' => 'https://schema.org/FundingScheme',
                        'url' => $proposal->ideascale_link,
                        'proposalId' => $proposal->id,
                        'fundingRequested' => $proposal->amount_requested,
                        'currency' => $proposal->currency,
                        'fund' => $proposal->fund->title ?? null,
                    ],
                ];
            })->toArray(),
        ];
    }
}
