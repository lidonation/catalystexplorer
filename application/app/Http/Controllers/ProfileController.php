<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ReviewData;
use App\Models\IdeascaleProfile;
use App\Models\Location;
use App\Models\User;
use App\Repositories\IdeascaleProfileRepository;
use App\Repositories\ReviewRepository;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $user->load('location');
        $userData = $user->only([
            'name',
            'email',
            'bio',
            'short_bio',
            'linkedin',
            'twitter',
            'website',
            'updated_at',
            'created_at',
            'password_updated_at',
        ]);
        $userData['city'] = $user->location ? $user->location->city : null;
        $userData['profile_photo_url'] = $user->getFirstMediaUrl('profile');
        $userData['profile_photo_thumbnail'] = $user->getFirstMediaUrl('profile', 'thumbnail');

        return Inertia::render('My/Profile/Index', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $userData,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request, string $field): RedirectResponse
    {
        $user = $request->user();
        $userData = $user->only([
            'name',
            'email',
            'bio',
            'profile_photo_path',
            'short_bio',
            'linkedin',
            'twitter',
            'website',
            'city',
            'updated_at',
            'created_at',
        ]);
        $validator = match ($field) {
            'name' => validator($request->all(), ['name' => ['required', 'string', 'max:255']]),
            'email' => validator($request->all(), [
                'email' => [
                    'required',
                    'string',
                    'lowercase',
                    'email',
                    'max:255',
                    Rule::unique(User::class)->ignore($user->id),
                ],
            ]),
            'city' => validator($request->all(), ['city' => ['nullable', 'string', 'max:255']]),
            'password' => validator($request->all(), [
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]),
            default => abort(400, 'Invalid field')
        };

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user->fill([$field => $request->input($field)]);

        if ($field === 'email' && $user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($field === 'password') {
            $user->update([
                'password' => Hash::make($request->input('password')),
                'password_updated_at' => now(),
            ]);
        } elseif ($field === 'city') {
            $city = $request->input('city');

            if ($city) {
                $location = Location::firstOrCreate(['city' => $city]);
                $user->location_id = $location->id;
                $user->save();
            } else {
                $user->location_id = null;
            }
            $user->save();
        } else {
            $user->save();
        }

        $user->save();

        return Redirect::route('my.profile')->with('status', 'Profile updated successfully.');
    }

    public function updateSocials(Request $request): RedirectResponse
    {
        $user = $request->user();

        $rules = [];
        $updates = [];

        if ($request->has('linkedin')) {
            $rules['linkedin'] = ['nullable', 'string', 'url', 'max:255'];
            $updates['linkedin'] = $request->input('linkedin');
        }

        if ($request->has('twitter')) {
            $rules['twitter'] = ['nullable', 'string', 'url', 'max:255'];
            $updates['twitter'] = $request->input('twitter');
        }

        if ($request->has('website')) {
            $rules['website'] = ['nullable', 'string', 'url', 'max:255'];
            $updates['website'] = $request->input('website');
        }

        if (! empty($rules)) {
            $validator = validator($request->all(), $rules);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $user->fill($updates);
            $user->save();
        }

        return Redirect::route('my.profile')->with('status', 'Social profiles updated successfully.');
    }

    public function updatePhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            $user->clearMediaCollection('profile');

            $user->addMedia($request->file('photo'))
                ->toMediaCollection('profile');

            $user?->ideascale_profiles()->searchable();

            return Redirect::route('my.profile')->with('status', 'Profile photo updated successfully.');
        }

        return Redirect::route('my.profile')->with('error', 'No photo provided.');
    }

    public function destroyPhoto(Request $request): RedirectResponse
    {
        $user = $request->user();

        $user->clearMediaCollection('profile');

        return Redirect::route('my.profile')->with('status', 'Profile photo removed successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function userSummary(Request $request): Response
    {
        $userId = $request->user()->id;

        $cacheKey = "user:{$userId}:dashboard_summary";

        [
            'totalsSummary' => $totalsSummary,
            'graphData' => $graphData,
        ] = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($userId) {
            $ideascaleProfile = app(IdeascaleProfileRepository::class);

            $args = [
                'filter' => ["claimed_by_id = {$userId}"],
                'attributesToRetrieve' => [
                    'proposals',
                    'name',
                    'username',
                    'completed_proposals_count',
                    'funded_proposals_count',
                    'unfunded_proposals_count',
                    'proposals_count',
                    'collaborating_proposals_count',
                    'own_proposals_count',
                    'amount_requested_ada',
                    'amount_requested_usd',
                    'proposals_total_amount_requested',
                    'completed_proposals_count',
                    'funded_proposals_count',
                    'unfunded_proposals_count',
                ],
            ];

            $builder = $ideascaleProfile->search('', $args);
            $hits = $builder->raw()['hits'] ?? [];

            $proposals = [];
            $totalsSummary = collect($hits)->reduce(function ($carry, $item) use (&$proposals) {
                $itemProposals = $item['proposals'] ?? [];

                $proposals = array_merge($proposals, is_array($itemProposals) ? $itemProposals : []);

                foreach ($item as $key => $value) {
                    if (is_int($value)) {
                        $carry[$key] = ($carry[$key] ?? 0) + $value;
                    }
                }

                return $carry;
            }, []);

            $metrics = [
                'USD' => ['amount_received', 'amount_requested'],
                'ADA' => ['amount_received', 'amount_requested'],
            ];

            $grouped = collect($proposals)
                ->filter(fn ($p) => isset($p['fund']) && is_array($p['fund']))
                ->groupBy(fn ($p) => $p['fund']['currency'] ?? 'Unknown Currency')
                ->map(
                    fn ($byCurrency) => $byCurrency->groupBy(fn ($p) => $p['fund']['title'])
                )->toArray();

            $graphData = [
                'amount_received' => [],
                'amount_awarded' => [],
            ];

            collect($metrics)->each(
                function ($fields, $currency) use ($grouped, &$graphData) {
                    if (! isset($grouped[$currency])) {
                        return;
                    }

                    $currencyData = collect($grouped[$currency])->map(function ($items, $fundTitle) use ($fields) {
                        $totals = collect($fields)->mapWithKeys(fn ($field) => [$field => 0]);

                        foreach ($items as $item) {
                            $totals = $totals->mapWithKeys(function ($val, $field) use ($item) {
                                $value = $item[$field] ?? 0;

                                if (str_starts_with($field, 'amount_requested') && empty($item['funded_at'])) {
                                    $value = 0;
                                }

                                return [$field => $val + $value];
                            });
                        }

                        return [
                            'x' => $fundTitle,
                            'y' => $totals->get('amount_received', 0),
                            'y_awarded' => $totals->get('amount_requested', 0),
                        ];
                    });

                    $graphData['amount_received'][$currency] = $currencyData
                        ->filter(fn ($data) => $data['y'] > 0 || $data['y_awarded'] > 0)
                        ->map(fn ($data) => [
                            'x' => $data['x'],
                            'y' => $data['y'],
                        ])->values();

                    $graphData['amount_awarded'][$currency] = $currencyData
                        ->filter(fn ($data) => $data['y'] > 0 || $data['y_awarded'] > 0)
                        ->map(fn ($data) => [
                            'x' => $data['x'],
                            'y' => $data['y_awarded'],
                        ])->values();
                }
            );

            return compact('totalsSummary', 'graphData');
        });

        return Inertia::render('My/Dashboard', [
            'totalsSummary' => $totalsSummary,
            'graphData' => $graphData,
        ]);
    }

    public function myReviews(Request $request, ReviewRepository $reviewRepository): Response
    {
        $userId = Auth::id();

        $cacheKey = "user:{$userId}:reviews_summary";

        [
            'aggregatedRatings' => $aggregatedRatings,
            'reviews' => $reviews,
            'ideascaleProfileHashes' => $ideascaleProfileHashes,
        ] = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($userId, $reviewRepository) {
            $ideascaleProfile = IdeascaleProfile::where('claimed_by_id', $userId)
                ->pluck('id');

            $ideascaleProfileHashes = implode(',', $ideascaleProfile->toArray());

            $args = [
                'filter' => ["proposal.ideascale_profiles.id IN [{$ideascaleProfileHashes}]"],
            ];

            $builder = $reviewRepository->search('', $args);
            $reviews = $builder->raw()['hits'] ?? [];

            $ratings = collect($reviews)->map(fn ($p) => $p['rating'])->groupBy('rating');
            $aggregatedRatings = $ratings->mapWithKeys(fn ($r, $k) => [$k => $r->count()]);

            return [
                'aggregatedRatings' => $aggregatedRatings,
                'reviews' => $reviews,
                'ideascaleProfileHashes' => $ideascaleProfileHashes,
            ];
        });

        return Inertia::render('My/Reviews/Index', [
            'aggregatedRatings' => $aggregatedRatings,
            'reviews' => Inertia::optional(
                fn () => to_length_aware_paginator(
                    ReviewData::collect(collect($reviews)->take(11)),
                    total: count($reviews),
                    perPage: 11,
                    currentPage: 1
                ),
            ),
            'ideascaleProfileHashes' => $ideascaleProfileHashes,
        ]);
    }
}
