@extends('emails.layouts.base')

@section('title', __('emails.bookmark_invitation.title'))

@section('content')
    @include('emails.components.greeting', [
        'content' => ($invitedUser->name ? __('emails.common.greeting') . ' ' . $invitedUser->name : __('emails.common.greeting'))
    ])

    <h1 style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif;">
        {{ __('emails.bookmark_invitation.heading') }}
    </h1>

    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => __('emails.bookmark_invitation.body', [
            'inviter_name' => $inviter->name,
            'collection_title' => $bookmarkCollection->title
        ])
    ])

    @if($bookmarkCollection->content)
        <div style="background-color: #f8fafc; border-left: 4px solid #0891b2; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; font-family: 'Inter', Arial, sans-serif; font-style: italic;">
                "{{ $bookmarkCollection->content }}"
            </p>
        </div>
    @endif

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; font-family: 'Inter', Arial, sans-serif;">
            {{ __('emails.bookmark_invitation.collection_details') }}
        </h2>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif;">
            <strong>{{ __('emails.bookmark_invitation.collection_name') }}:</strong> {{ $bookmarkCollection->title }}
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif;">
            <strong>{{ __('emails.bookmark_invitation.invited_by') }}:</strong> {{ $inviter->name }}
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; font-family: 'Inter', Arial, sans-serif;">
            <strong>{{ __('emails.bookmark_invitation.items_count') }}:</strong> {{ $bookmarkCollection->items_count ?? 0 }} {{ __('emails.bookmark_invitation.items') }}
        </p>
    </div>

    @include('emails.components.text-block', [
        'type' => 'body',
        'content' => __('emails.bookmark_invitation.accept_instructions')
    ])

    @include('emails.components.button', [
        'url' => $acceptUrl,
        'text' => __('emails.bookmark_invitation.accept_button'),
        'preset' => 'default',
        'color' => '#0891b2'
    ])

    <div style="text-align: center; margin: 20px 0; padding: 20px 0; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0; font-family: 'Inter', Arial, sans-serif;">
            {{ __('emails.bookmark_invitation.or_copy_link') }}
        </p>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 8px 0; font-family: 'Inter', Arial, sans-serif; word-break: break-all;">
            <a href="{{ $acceptUrl }}" style="color: #0891b2; text-decoration: none;">{{ $acceptUrl }}</a>
        </p>
    </div>

    @include('emails.components.text-block', [
        'type' => 'signature',
        'content' => __('emails.bookmark_invitation.signature')
    ])
@endsection
