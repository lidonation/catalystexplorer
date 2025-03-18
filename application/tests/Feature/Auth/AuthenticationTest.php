<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password')
    ]);

    $this->withSession(['_token' => 'lido'])
        ->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
            '_token' => 'lido',
        ]);

    $this->assertAuthenticated();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->withSession(['_token' => 'lido'])
        ->actingAs($user)
        ->post(route('logout'), [
            '_token' => 'lido',
        ]);

    $this->assertGuest();
    $response->assertRedirect('/');
});
