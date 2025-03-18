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

//test('reset password screen can be rendered', function () {
//    Notification::fake();
//
//    $user = User::factory()->create();
//
//    $this->withSession(['_token' => 'lido'])
//        ->post(route('password.forgot'), [
//            'email' => $user->email,
//            '_token' => 'lido',
//        ]);
//
//    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
//        $response = $this->get('/reset-password/' . $notification->token);
//        $response->assertStatus(200);
//
//        return true;
//    });
//});

//test('password can be reset with valid token', function () {
//    Notification::fake();
//
//    $user = User::factory()->create();
//
//    $this->withSession(['_token' => 'lido'])
//        ->post(route('password.forgot'), [
//            'email' => $user->email,
//            '_token' => 'lido',
//        ]);
//
//    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
//        $response = $this->post('/reset-password', [
//            'token' => $notification->token,
//            'email' => $user->email,
//            'password' => 'password',
//            'password_confirmation' => 'password',
//        ]);
//
//        $response
//            ->assertSessionHasNoErrors()
//            ->assertRedirect(route('login'));
//
//        return true;
//    });
//});
