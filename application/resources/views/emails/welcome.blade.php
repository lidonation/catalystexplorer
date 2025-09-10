@extends('emails.layouts.base')

@section('title', 'Account Created Successfully - Catalyst Explorer')

@section('content')
    @include('emails.components.greeting', ['user' => $user])
    
    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => "Thank you for signing up with Catalyst Explorer.\n\nWe are pleased to welcome you to Catalyst Explorer, a comprehensive tool designed to help you explore, track, and engage with proposals under Project Catalyst, Cardano's decentralized innovation fund.\n\nWith your new account, you can:\n\n- View and analyze proposals in real time\n- Bookmark and organize items of interest\n- Submit your own proposals for community consideration\n- Monitor funding progress, categories, and voting trends\n- Manage your preferences and alerts through your personalized dashboard\n\nTo begin, please log in and explore the tools now available to you."
    ])

    @include('emails.components.button', [
        'url' => url(app()->getLocale() . '/my/dashboard'),
        'text' => 'Go to Dashboard',
        'preset' => 'default',
        'color' => '#0891b2'
    ])
    
    @include('emails.components.text-block', [
        'type' => 'signature',
        'content' => "We appreciate your interest and look forward to your participation in shaping the future of decentralized governance.\n\nBest regards,\n\n**The Catalyst Explorer Team**"
    ])
@endsection
