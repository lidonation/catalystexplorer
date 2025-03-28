<?php

test('new users can register', function () {
    $response = $this->withSession(['_token' => 'lido'])
        ->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            '_token' => 'lido',
        ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('my.dashboard', absolute: false));
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'name' => 'Test User',
    ]);
});
test('registration requires valid fields', function () {
    $response = $this->withSession(['_token' => 'lido'])
        ->post(route('register.store'), [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'pass',
            'password_confirmation' => 'word',
            '_token' => 'lido',
        ]);

    $response->assertSessionHasErrors(['name', 'email', 'password']);
    $this->assertGuest();
});
