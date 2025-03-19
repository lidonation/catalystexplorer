<?php

use App\Models\User;

test('password can be confirmed', function () {
    $user = User::factory()->create();

    $response = $this->withSession(['_token' => 'lido'])
        ->actingAs($user)
        ->post(route('password.confirm.store'), [
            'password' => 'password',
            '_token' => 'lido',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
});

test('password is not confirmed with invalid password', function () {
    $user = User::factory()->create();

    $response = $this->withSession(['_token' => 'lido'])
        ->actingAs($user)->post(route('password.confirm.store'), [
            'password' => 'wrong-password',
            '_token' => 'lido',
        ]);

    $response->assertSessionHasErrors();
});
