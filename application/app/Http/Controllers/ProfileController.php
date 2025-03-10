<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'name', 'email', 'bio', 'profile_photo_path', 'short_bio',
            'linkedin', 'twitter', 'website', 'city', 'updated_at', 'created_at',
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
}
