<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $user = User::factory()->create();
    $locale = app()->getLocale(); // Typically 'en'

    $response = $this
        ->withSession(['_token' => 'lido'])
        ->actingAs($user)
        ->from("/{$locale}/profile")
        ->put("/{$locale}/password", [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            '_token' => 'lido',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect("/{$locale}/profile");

    $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();
    $locale = app()->getLocale(); // Typically 'en'

    $response = $this
        ->withSession(['_token' => 'lido'])
        ->actingAs($user)
        ->from("/{$locale}/profile")
        ->put("/{$locale}/password", [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            '_token' => 'lido',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect("/{$locale}/profile");
});
