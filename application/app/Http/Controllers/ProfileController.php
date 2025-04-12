<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\User;
use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $ideascaleProfile = app(IdeascaleProfileRepository::class);

        $args = [
            'filter' => ["claimed_by_id = {$userId}"],
            'attributesToRetrieve' => $attrs ?? [
                'proposals',
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

        $builder = $ideascaleProfile->search(
            '',
            $args
        );

        $hits = $builder->raw()['hits'];

        $proposals = [];

        $totalsSummary = collect($hits)->reduce(function ($carry, $item) use (&$proposals) {
            $proposals = array_merge($proposals, $item['proposals']);
            foreach ($item as $key => $value) {
                if (is_int($value)) {
                    $carry[$key] = ($carry[$key] ?? 0) + $value;
                }
            }

            return $carry;
        }, []);

        $metrics = [
            'USD' => ['amount_received_USD', 'amount_awarded_USD'],
            'ADA' => ['amount_received_ADA', 'amount_awarded_ADA'],
        ];

        $grouped = collect($proposals)->groupBy(fn ($p) => $p['currency'])
            ->map(fn ($byCurrency) => $byCurrency->groupBy(fn ($p) => $p['fund']['title'] ?? 'Unknown Fund'));

        $graphData = [
            'amount_received' => [],
            'amount_awarded' => [],
        ];

        collect($metrics)->each(function ($fields, $currency) use ($grouped, &$graphData) {
            if (! isset($grouped[$currency])) {
                return;
            }

            $currencyData = $grouped[$currency]->map(function ($items, $fundTitle) use ($fields, $currency) {
                $totals = collect($fields)->mapWithKeys(fn ($field) => [$field => 0]);

                foreach ($items as $item) {
                    $totals = $totals->mapWithKeys(fn ($val, $field) => [
                        $field => $val + ($item[$field] ?? 0),
                    ]);
                }

                return [
                    'x' => $fundTitle,
                    'y' => $totals->get("amount_received_{$currency}", 0),
                    'y_awarded' => $totals->get("amount_awarded_{$currency}", 0),
                ];
            });

            $graphData['amount_received'][$currency] = $currencyData->map(fn ($data) => [
                'x' => $data['x'],
                'y' => $data['y'],
            ])->values();

            $graphData['amount_awarded'][$currency] = $currencyData->map(fn ($data) => [
                'x' => $data['x'],
                'y' => $data['y_awarded'],
            ])->values();
        });

        return Inertia::render(
            'My/Dashboard',
            [
                'totalsSummary' => $totalsSummary,
                'graphData' => $graphData,
            ]
        );
    }
}
