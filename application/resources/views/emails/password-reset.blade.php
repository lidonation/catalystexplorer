{{-- resources/views/emails/password-reset.blade.php --}}
@extends('emails.layouts.base')

@section('title', 'Reset Your Password - Catalyst Explorer')

@section('content')
    @include('emails.components.greeting', ['user' => $user])
    
    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => 'You are receiving this email because we received a password reset request for your account.'
    ])
    
    @include('emails.components.button', [
        'url' => $resetUrl,
        'text' => 'Reset Password',
        'preset' => 'default',
        'color' => '#0891b2'
    ])
    
    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => 'This password reset link will expire in **60 minutes**.
    
            If you did not request a password reset, no further action is required.
        '
    ])
    
    @include('emails.components.text-block', [
        'type' => 'signature',
        'content' => '**Best regards,**  
            **Catalyst Explorer Team**

            ---

            If you\'re having trouble clicking the button, copy and paste the URL below into your web browser:  
            [' . $resetUrl . '](' . $resetUrl . ')
        '
    ])
@endsection
