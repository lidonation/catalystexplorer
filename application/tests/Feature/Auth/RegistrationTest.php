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
});
