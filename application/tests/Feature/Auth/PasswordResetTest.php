<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->withSession(['_token' => 'lido'])
        ->post(route('password.forgot'), [
            'email' => $user->email,
            '_token' => 'lido',
        ]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->withSession(['_token' => 'lido'])
        ->post(route('password.forgot'), [
            'email' => $user->email,
            '_token' => 'lido',
        ]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $locale = app()->getLocale();
        $response = $this->get("/{$locale}/reset-password/{$notification->token}");
        $response->assertStatus(200);

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->withSession(['_token' => 'lido'])
        ->post(route('password.forgot'), [
            'email' => $user->email,
            '_token' => 'lido',
        ]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $locale = app()->getLocale();
        $resetFormResponse = $this->get("/{$locale}/reset-password/{$notification->token}");
        $resetFormResponse->assertStatus(200);

        $response = $this->withSession(['_token' => 'lido'])
            ->post("/{$locale}/reset-password", [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'password',
                'password_confirmation' => 'password',
                '_token' => 'lido',
            ]);

        $response->assertSessionHasNoErrors()
            ->assertRedirect(route("{$locale}.login"));

        return true;
    });
});
