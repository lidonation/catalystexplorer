{{-- resources/views/emails/welcome.blade.php --}}
@extends('emails.layouts.base')

@section('title', __('emails.welcome.title'))

@section('content')
    @include('emails.components.greeting', [
        'content' => ($user->name ? __('emails.common.greeting') . ' ' . $user->name : __('emails.common.greeting'))
    ])
    
    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => __('emails.welcome.body')
    ])

    @include('emails.components.button', [
        'url' => url(app()->getLocale() . '/my/dashboard'),
        'text' => __('emails.welcome.button_text'),
        'preset' => 'default',
        'color' => '#0891b2'
    ])
    
    @include('emails.components.text-block', [
        'type' => 'signature',
        'content' => __('emails.welcome.signature')
    ])
@endsection
