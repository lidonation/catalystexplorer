{{-- resources/views/emails/password-reset.blade.php --}}
@extends('emails.layouts.base')

@section('title', __('emails.password_reset.title'))

@section('content')
    @include('emails.components.greeting', [
        'content' => ($user->name ? __('emails.common.greeting') . ' ' . $user->name : __('emails.common.greeting'))
    ])
    
    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => __('emails.password_reset.body')
    ])
    
    @include('emails.components.button', [
        'url' => $resetUrl,
        'text' => __('emails.password_reset.button_text'),
        'preset' => 'default',
        'color' => '#0891b2'
    ])
    
    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => __('emails.password_reset.expiry_notice')
    ])
    
    @include('emails.components.text-block', [
        'type' => 'signature',
        'content' => __('emails.password_reset.signature', ['resetUrl' => $resetUrl])
    ])
@endsection
