<?php

use App\Models\User;

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->withSession(['_token' => 'lido'])
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            '_token' => 'lido',
        ]);

    $response
        ->assertSessionHasNoErrors();

//    $user->refresh();

//    $this->assertSame('Test User', $user->name);
//    $this->assertSame('test@example.com', $user->email);
//    $this->assertNull($user->email_verified_at);
});

//test('email verification status is unchanged when the email address is unchanged', function () {
//    $user = User::factory()->create();
//
//    $response = $this
//        ->withSession(['_token' => 'lido'])
//        ->actingAs($user)
//        ->patch('/profile', [
//            'name' => 'Test User',
//            'email' => $user->email,
//            '_token' => 'lido',
//        ]);
//
//    $response
//        ->assertSessionHasNoErrors()
//        ->assertRedirect('/profile');
//
//    $this->assertNotNull($user->refresh()->email_verified_at);
//});

//test('user can delete their account', function () {
//    $user = User::factory()->create();
//
//    $response = $this
//        ->withSession(['_token' => 'lido'])
//        ->actingAs($user)
//        ->delete('/profile', [
//            'password' => 'password',
//            '_token' => 'lido',
//        ]);
//
//    $response
//        ->assertSessionHasNoErrors()
//        ->assertRedirect('/');
//
//    $this->assertGuest();
//    $this->assertNull($user->fresh());
//});

//test('correct password must be provided to delete account', function () {
//    $user = User::factory()->create();
//
//    $response = $this
//        ->withSession(['_token' => 'lido'])
//        ->actingAs($user)
//        ->from('/profile')
//        ->delete('/profile', [
//            'password' => 'wrong-password',
//            '_token' => 'lido',
//        ]);
//
//    $response
//        ->assertSessionHasErrors('password')
//        ->assertRedirect('/profile');
//
//    $this->assertNotNull($user->fresh());
//});
