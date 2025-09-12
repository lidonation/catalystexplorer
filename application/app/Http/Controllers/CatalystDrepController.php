<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\CatalystDrepData;
use App\DataTransferObjects\UserData;
use App\Models\BookmarkCollection;
use App\Models\CatalystDrep;
use App\Models\Meta;
use App\Models\Signature;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CatalystDrepController extends Controller
{
    /**
     * Display a landing page.
     */
    public function index(Request $request): Response
    {
        $drep = '';

        return Inertia::render('Dreps/Index');
    }

    public function show(Request $request, string $stake_address): Response
    {
        $user = Auth::user();
        $drep = CatalystDrep::whereHas('signatures', function ($query) use ($stake_address) {
            $query->where('stake_address', $stake_address);
        })
            ->firstOrFail();

        $delegatedDrepStakeAddress = DB::table('catalyst_drep_user')
            ->where('user_id', $user?->id)
            ->pluck('catalyst_drep_stake_address')
            ->first();

        $delegators = to_length_aware_paginator(
            UserData::collect(
                $drep->delegators()->paginate(8, ['*'], 'p', $request->input('p'))
            )
        )->onEachSide(0);

        $userIsDelegator = $drep->delegators()
            ->wherePivot('user_id', Auth::id())
            ->exists();

        $votingListQuery = BookmarkCollection::query()
            ->where('user_id', $drep->user_id)
            ->where('status', 'published')
            ->whereIn('visibility', $userIsDelegator ? ['public', 'delegators'] : ['public']);

        $votingList = to_length_aware_paginator(
            BookmarkCollectionData::collect(
                $votingListQuery->paginate(8, ['*'], 'v', request()->input('v'))
            )
        )->onEachSide(0);

        return Inertia::render('Dreps/Drep', [
            'drep' => CatalystDrepData::from($drep),
            'delegatedDrepStakeAddress' => $delegatedDrepStakeAddress,
            'delegators' => $delegators,
            'votingList' => $votingList,
            'filters' => [],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function list(Request $request): Response
    {
        $user = Auth::user();

        $delegatedDrepStakeAddress = DB::table('catalyst_drep_user')
            ->where('user_id', $user?->id)
            ->pluck('catalyst_drep_stake_address')
            ->first();

        return Inertia::render('Dreps/DrepList', [
            'catalystDreps' => to_length_aware_paginator(
                CatalystDrepData::collect(
                    CatalystDrep::withCount(['delegators'])
                        ->paginate(11, ['*'], 'p', $request->input('p'))
                )
            )->onEachSide(0),
            'filters' => [],
            'delegatedDrepStakeAddress' => $delegatedDrepStakeAddress,
        ]);
    }

    /**
     * Summary of drep sign up Steps
     *
     * @param  mixed  $step
     */
    public function handleStep(Request $request, $step)
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {
        $catalystDrep = CatalystDrep::find($request->catalystDrep);

        $savedLocale = session('drep_signup_locale', 'en');

        return Inertia::render('Workflows/CatalystDrepSignup/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'catalystDrep' => $catalystDrep ? $this->transformCatalystDrepForLocale($catalystDrep, $savedLocale) : null,
            'savedLocale' => $savedLocale,
        ]);
    }

    public function step2(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => '1']);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Step2', [
            'catalystDrep' => $catalystDrep->id,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step3(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => '1']);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Step3', [
            'catalystDrep' => $catalystDrep->id,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step4(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => 1]);
        }

        if (empty($catalystDrep?->modelSignatures)) {
            return to_route('workflows.drepSignUp.index', ['step' => 3]);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Success', [
            'catalystDrep' => $catalystDrep->id,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step5(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => 1]);
        }

        if (empty($catalystDrep?->modelSignatures)) {
            return to_route('workflows.drepSignUp.index', ['step' => 3]);
        }

        // Get saved locale from session or default to 'en'
        $savedLocale = session('drep_signup_locale', 'en');

        return Inertia::render('Workflows/CatalystDrepSignup/Step5', [
            'catalystDrep' => $this->transformCatalystDrepForLocale($catalystDrep, $savedLocale),
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'savedLocale' => $savedLocale,
        ]);
    }

    public function saveDrep(Request $request)
    {
        $supportedLocales = implode(',', config('locales.supported', ['en']));

        $attributes = $request->validate([
            'name' => 'required|min:3',
            'bio' => 'min:69',
            'link' => 'url:http,https|nullable',
            'email' => 'email',
            'locale' => "string|in:{$supportedLocales}",
        ]);

        $locale = $attributes['locale'] ?? 'en';
        $bio = $attributes['bio'] ?? null;

        session(['drep_signup_locale' => $locale]);

        unset($attributes['locale'], $attributes['bio']);

        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if ($catalystDrep) {

            $catalystDrep->update($attributes);

            if (! empty($bio)) {
                $catalystDrep->setTranslation('bio', $locale, $bio);
                $catalystDrep->save();
            }
        } else {

            $catalystDrep = CatalystDrep::create(array_merge($attributes, ['user_id' => Auth::user()->id]));

            if (! empty($bio)) {
                $catalystDrep->setTranslation('bio', $locale, $bio);
                $catalystDrep->save();
            }
        }

        return to_route('workflows.drepSignUp.index', ['step' => 2]);
    }

    public function validateDrepWallet(CatalystDrep $catalystDrep, Request $request)
    {
        $stakeAddressPattern = app()->environment('production')
            ? '/^stake1[0-9a-z]{38,}$/'
            : '/^stake_test1[0-9a-z]{38,}$/';

        $request->validate([
            'stakeAddress' => [
                'required',
                "regex:$stakeAddressPattern",
            ],
        ]);

        // $prevVotingHistory = DB::select('SELECT reg.stake_pub,
        //                     COUNT(DISTINCT cs.model_id) AS distinct_fund_ids
        //                 FROM public.voting_powers cvp
        //                 JOIN public.delegations d ON cvp.voter_id = d.cat_onchain_id
        //                 LEFT JOIN public.snapshots cs ON cvp.snapshot_id = cs.id
        //                 LEFT JOIN public.registrations reg ON d.registration_id = reg.id
        //                 WHERE cvp.consumed = true
        //                 AND cs.model_id IS NOT NULL
        //                 AND reg.stake_pub = ?
        //                 GROUP BY reg.stake_pub
        //     ', [$request->stakeAddress]);

        // if (empty($prevVotingHistory) || $prevVotingHistory[0]?->distinct_fund_ids < 2) {
        //     return back()->withErrors(['message' => 'workflows.catalystDrepSignup.2roundsRule']);
        // }

        return to_route('workflows.drepSignUp.index', ['step' => 3]);
    }

    public function captureSignature(CatalystDrep $catalystDrep, Request $request)
    {
        $stakeAddressPattern = app()->environment('production')
            ? '/^stake1[0-9a-z]{38,}$/'
            : '/^stake_test1[0-9a-z]{38,}$/';

        $validated = $request->validate([
            'signature' => 'required|string',
            'signature_key' => 'required|string',
            'stake_key' => 'required|string',
            'stakeAddress' => [
                'required',
                "regex:$stakeAddressPattern",
            ],
        ]);

        // Create or update the signature
        $signature = Signature::updateOrCreate(
            [
                'stake_key' => $validated['stake_key'],
                'stake_address' => $validated['stakeAddress'],
                'user_id' => Auth::user()->id,
            ],
            $validated
        );

        // Attach the signature to the CatalystDrep if not already attached
        $catalystDrep->modelSignatures()->firstOrCreate([
            'model_id' => $catalystDrep->id,
            'model_type' => CatalystDrep::class,
            'signature_id' => $signature->id,
        ]);

        // if (empty($signature->catalystProfileRegistration)) {
        //     return back()->withErrors(['message' => 'workflows.catalystDrepSignup.hasCatalystProfile']);
        // }

        return to_route('workflows.drepSignUp.index', ['step' => 4]);
    }

    public function updateDrep(CatalystDrep $catalystDrep, Request $request)
    {
        $supportedLocales = implode(',', config('locales.supported', ['en']));

        $attributes = $request->validate([
            'objective' => 'required|min:69',
            'motivation' => 'required|min:69',
            'qualifications' => 'required|min:69',
            'locale' => "string|in:{$supportedLocales}",
        ]);

        $locale = $attributes['locale'] ?? session('drep_signup_locale', 'en');

        session(['drep_signup_locale' => $locale]);

        unset($attributes['locale']);

        foreach (['objective', 'motivation', 'qualifications'] as $field) {
            if (! empty($attributes[$field])) {
                $catalystDrep->setTranslation($field, $locale, $attributes[$field]);
            }
        }

        $catalystDrep->save();

        return to_route('workflows.drepSignUp.index', ['step' => 5]);
    }

    public function publishPlatformStatementToIpfs(CatalystDrep $catalystDrep, Request $request)
    {
        $supportedLocales = implode(',', config('locales.supported', ['en']));

        $attributes = $request->validate([
            'objective' => 'required|min:69',
            'motivation' => 'required|min:69',
            'qualifications' => 'required|min:69',
            'locale' => "string|in:{$supportedLocales}",
            'paymentAddress' => 'string|nullable', // Add payment address from wallet
        ]);

        $locale = $attributes['locale'] ?? session('drep_signup_locale', 'en');
        $paymentAddress = $attributes['paymentAddress'] ?? null;
        unset($attributes['locale'], $attributes['paymentAddress']);

        try {
            foreach (['objective', 'motivation', 'qualifications'] as $field) {
                if (! empty($attributes[$field])) {
                    $catalystDrep->setTranslation($field, $locale, $attributes[$field]);
                }
            }

            $catalystDrep->save();

            $jsonLdData = $this->generatePlatformStatementJsonLd($catalystDrep, $locale, $paymentAddress);

            $filename = "drep-platform-statement-{$catalystDrep->id}-{$locale}.json";
            $cid = $catalystDrep->uploadToIpfs(json_encode($jsonLdData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), $filename);
            $gatewayUrl = $catalystDrep->getIpfsUrl($cid);

            $catalystDrep->pinToIpfs($cid);

            Meta::updateOrCreate(
                [
                    'model_type' => CatalystDrep::class,
                    'model_id' => $catalystDrep->id,
                    'key' => 'ipfs_platform_statement_cid',
                ],
                [
                    'content' => $cid,
                ]
            );

            Meta::updateOrCreate(
                [
                    'model_type' => CatalystDrep::class,
                    'model_id' => $catalystDrep->id,
                    'key' => 'ipfs_platform_statement_gateway_url',
                ],
                [
                    'content' => $gatewayUrl,
                ]
            );

            return back()->with('success', [
                'message' => 'Platform statement successfully published to IPFS',
                'ipfs_cid' => $cid,
                'gateway_url' => $gatewayUrl,
                'filename' => $filename,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to publish platform statement to IPFS: '.$e->getMessage()]);
        }
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.catalystDrepSignup.createAccount',
                'info' => 'workflows.catalystDrepSignup.createAccountInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.connectWallet',
                'info' => 'workflows.catalystDrepSignup.connectWalletInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.signWallet',
                'info' => 'workflows.catalystDrepSignup.signWalletInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.success',
                'info' => 'workflows.catalystDrepSignup.successInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.platformStatement',
                'info' => 'workflows.catalystDrepSignup.platformStatementInfo',
            ],
        ]);
    }

    /**
     * Generate JSON-LD platform statement data for IPFS upload
     */
    private function generatePlatformStatementJsonLd(CatalystDrep $catalystDrep, string $locale = 'en', ?string $paymentAddress = null): array
    {
        // Build references array
        $references = [];
        if (! empty($catalystDrep->link)) {
            $references[] = [
                '@type' => 'Link',
                'label' => $catalystDrep->name ?: 'DRep Link',
                'uri' => $catalystDrep->link,
            ];
        }

        return [
            '@context' => [
                '@language' => $this->convertToJsonLdLanguage($locale),
                'CIP100' => 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#',
                'CIP119' => 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0119/README.md#',
                'hashAlgorithm' => 'CIP100:hashAlgorithm',
                'body' => [
                    '@id' => 'CIP119:body',
                    '@context' => [
                        'references' => [
                            '@id' => 'CIP119:references',
                            '@container' => '@set',
                            '@context' => [
                                'GovernanceMetadata' => 'CIP100:GovernanceMetadataReference',
                                'Identity' => 'CIP119:IdentityReference',
                                'Link' => 'CIP119:LinkReference',
                                'Other' => 'CIP100:OtherReference',
                                'label' => 'CIP100:reference-label',
                                'uri' => 'CIP100:reference-uri',
                                'referenceHash' => [
                                    '@id' => 'CIP119:referenceHash',
                                    '@context' => [
                                        'hashDigest' => 'CIP119:hashDigest',
                                        'hashAlgorithm' => 'CIP100:hashAlgorithm',
                                    ],
                                ],
                            ],
                        ],
                        'paymentAddress' => 'CIP119:paymentAddress',
                        'givenName' => 'CIP119:givenName',
                        'image' => [
                            '@id' => 'CIP119:image',
                            '@context' => [
                                'ImageObject' => 'https://schema.org/ImageObject',
                                'contentUrl' => 'CIP119:contentUrl',
                                'sha256' => 'CIP119:sha256',
                            ],
                        ],
                        'objectives' => 'CIP119:objectives',
                        'motivations' => 'CIP119:motivations',
                        'qualifications' => 'CIP119:qualifications',
                        'doNotList' => 'CIP119:doNotList',
                        'bio' => 'CIPQQQ:bio',
                        'dRepName' => 'CIPQQQ:dRepName',
                        'email' => 'CIPQQQ:email',
                    ],
                ],
                'authors' => [
                    '@id' => 'CIP100:authors',
                    '@container' => '@set',
                    '@context' => [
                        'name' => 'http://xmlns.com/foaf/0.1/name',
                        'witness' => [
                            '@id' => 'CIP100:witness',
                            '@context' => [
                                'witnessAlgorithm' => 'CIP100:witnessAlgorithm',
                                'publicKey' => 'CIP100:publicKey',
                                'signature' => 'CIP100:signature',
                            ],
                        ],
                    ],
                ],
            ],
            'authors' => [],
            'hashAlgorithm' => 'blake2b-256',
            'body' => [
                'givenName' => $catalystDrep->name,
                'dRepName' => $catalystDrep->name,
                'bio' => $catalystDrep->getTranslation('bio', $locale) ?: '',
                'email' => $catalystDrep->email ?: '',
                'objectives' => $catalystDrep->getTranslation('objective', $locale) ?: '',
                'motivations' => $catalystDrep->getTranslation('motivation', $locale) ?: '',
                'qualifications' => $catalystDrep->getTranslation('qualifications', $locale) ?: '',
                'paymentAddress' => $paymentAddress ?: '',
                'references' => $references,
            ],
        ];
    }

    /**
     * Convert locale code to JSON-LD language format
     */
    private function convertToJsonLdLanguage(string $locale): string
    {
        $languageMapping = [
            'en' => 'en-us',
            'es' => 'es-es',
            'fr' => 'fr-fr',
            'de' => 'de-de',
            'ja' => 'ja-jp',
            'ko' => 'ko-kr',
            'pt' => 'pt-pt',
            'ru' => 'ru-ru',
            'zh' => 'zh-cn',
        ];

        return $languageMapping[$locale] ?? 'en-us';
    }

    public function delegate()
    {
        return $this->collectUserSignature(Auth::user(), request());
    }

    public function collectUserSignature(User $user, Request $request)
    {
        $stakeAddressPattern = app()->environment('production')
            ? '/^stake1[0-9a-z]{38,}$/'
            : '/^stake_test1[0-9a-z]{38,}$/';

        $validated = $request->validate([
            'signature' => 'required|string',
            'signature_key' => 'required|string',
            'stake_key' => 'required|string',
            'stakeAddress' => [
                'required',
                "regex:$stakeAddressPattern",
            ],
        ]);

        $userStakeAddress = $validated['stakeAddress'];
        $hasAuthenticatedUserDelegated = false;

        if ($user) {
            $hasAuthenticatedUserDelegated = DB::table('catalyst_drep_user')->where('user_id', $user->id)
                ->where('user_stake_address', $userStakeAddress)
                ->exists();
        }

        if ($hasAuthenticatedUserDelegated) {
            return response()->json([
                'error' => 'You can only delegate once',
            ], 422);
        }

        $signature = Signature::updateOrCreate(
            [
                'stake_key' => $validated['stake_key'],
                'stake_address' => $validated['stakeAddress'],
                'user_id' => Auth::user()->id,
            ],
            $validated
        );

        $user->modelSignatures()->firstOrCreate(
            [
                'model_id' => $user->id,
                'model_type' => User::class,
                'signature_id' => $signature->id,
            ]
        );

        $drepStakeAddress = $request->validate(
            [
                'drep_stake_address' => [
                    'required',
                    "regex:$stakeAddressPattern",
                ],
            ],
            [
                'drep_stake_address.required' => 'DRep stake address is required.',
                'drep_stake_address.regex' => 'DRep stake address format is invalid.',
            ]
        );

        if (empty($drepStakeAddress['drep_stake_address'])) {
            return response()->json([
                'error' => 'The DRep stake address is required and cannot be empty.',
            ], 422);
        }

        $drepId = DB::table('signatures')
            ->join('catalyst_dreps', 'catalyst_dreps.user_id', '=', 'signatures.user_id')
            ->where('signatures.stake_address', $drepStakeAddress['drep_stake_address'])
            ->value('catalyst_dreps.id');

        if (! $drepId) {
            return response()->json([
                'error' => 'DRep not found for provided stake address',
            ], 422);
        }

        DB::table('catalyst_drep_user')->updateOrInsert(
            [
                'user_id' => $user->id,
                'catalyst_drep_id' => $drepId,
                'user_stake_address' => $validated['stakeAddress'],
                'catalyst_drep_stake_address' => $drepStakeAddress['drep_stake_address'],
            ],
            [
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Delegation successful!',
        ], 200);
    }

    public function undelegate(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'stakeAddress' => 'required|string',
            'drepStakeAddress' => 'required|string',
        ]);

        DB::table('catalyst_drep_user')->where([
            'user_id' => $user->id,
            'user_stake_address' => $validated['stakeAddress'],
            'catalyst_drep_stake_address' => $validated['drepStakeAddress'],
        ])->delete();

        return response()->json([
            'message' => 'Undelegation successful!',
        ], 200);
    }

    /**
     * Transform CatalystDrep data to include translations for specific locale
     */
    private function transformCatalystDrepForLocale(CatalystDrep $catalystDrep, string $locale): array
    {
        $data = CatalystDrepData::from($catalystDrep)->toArray();

        // Override translatable fields with the specific locale data
        foreach (['bio', 'motivation', 'qualifications', 'objective'] as $field) {
            $translation = $catalystDrep->getTranslation($field, $locale, false);
            if ($translation) {
                $data[$field] = $translation;
            } else {
                // If no translation exists for this locale, try to get any available translation
                $translations = $catalystDrep->getTranslations($field);
                if (! empty($translations)) {
                    // Get the first available translation
                    $data[$field] = array_values($translations)[0];
                } else {
                    $data[$field] = '';
                }
            }
        }

        $data['locale'] = $locale;

        return $data;
    }
}
