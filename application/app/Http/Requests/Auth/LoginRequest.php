<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Actions\DecodeCardanoSignature;
use App\Models\Signature;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required_without_all:stakeAddress,signature',
                'nullable',
                'email',
            ],
            'password' => [
                'required_with:email',
                'nullable',
                'string',
            ],
            'stakeAddress' => [
                'required_without_all:email,password',
                'nullable',
                'string',
                'regex:/^(stake1[0-9a-z]{50,59}|stake_test1[0-9a-z]{50,59})$/',
            ],
            'signature' => [
                'required_with:stakeAddress',
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required_without_all' => 'Email is required if stakeAddress is not provided.',
            'stakeAddress.required_without_all' => 'Stake address is required if email is not provided.',
            'signature.required_with' => 'Signature is required when using stake address login.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    // attributes: array:8 [▼
    //     "bech32_address" => "addr_test1qzkat2wajs5kprmt8w57akf6z7spvmw2ur0flx0m0t69mqsmxuy625lw35z2j99z5y278k2wkfpy2722arw55gxqph2ssn7772"
    //     "network" => "Network.TESTNET"
    //     "address_type" => "AddressType.KEY_KEY"
    //     "payment_key_hash" => "add5a9dd9429608f6b3ba9eed93a17a0166dcae0de9f99fb7af45d82"
    //     "stake_address" => "stake_test1uqdnwzd920hg6p9fzj32z90rm98tysj9099w3h22yrqqm4gal99sd"
    //     "stake_key_hash" => "1b3709a553ee8d04a914a2a115e3d94eb24245794ae8dd4a20c00dd5"
    //     "signature_message" => "Catalyst Explorer Account sign in"
    //     "signature_hex" => "125604a3ed9d1b824beef1ac46db5489c68fd3f458038720bd8ba9e90c773ef8661a472823d002031a06140624ea85aa7f785e503f04681e4c2516b805f1e201"
    //   ]
    // }

    public function authenticateWallet()
    {
        $this->ensureIsNotRateLimited();

        // try {
        $userSig = $this->string('signature')->value();
        $signatureData = (new DecodeCardanoSignature)($userSig);
        $fluentSig = toFluentDeep($signatureData);
        $stakeAddress = $this->string('stakeAddress')->value();

        if ($stakeAddress != $fluentSig->stake_address) {
            throw ValidationException::withMessages([
                'signature' => trans('auth.failed'),
            ]);
        }

        $signature = Signature::where('stake_address', $fluentSig->stake_address)->first();

        $user = $signature?->user;

        if (! $user) {
            $user = User::create(
                [
                    'wallet_stake_address' => $stakeAddress,
                    'wallet_address' => $fluentSig->bech32_address,
                    'name' => $fluentSig->bech32_address,
                ],
            );
        }

        if (! $signature) {
            $signature = Signature::create(
                [
                    'stake_address' => $stakeAddress,
                    'user_id' => $user->id,
                    'signature' => $userSig,
                ],
            );
        }

        if ($user = $signature?->user) {
            Auth::login($user);
        }

        // } catch (\Throwable $th) {
        //     throw ValidationException::withMessages([
        //         'signature' => trans('auth.failed'),
        //     ]);
        // }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
