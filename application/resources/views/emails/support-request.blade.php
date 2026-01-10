@extends('emails.layouts.base')

@section('title', 'Support Request')

@section('content')
    <h1 style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif;">
        New Support Request
    </h1>

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; font-family: 'Inter', Arial, sans-serif;">
            Contact Details
        </h2>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif;">
            <strong>Name:</strong> {{ $senderName }}
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; font-family: 'Inter', Arial, sans-serif;">
            <strong>Email:</strong> <a href="mailto:{{ $senderEmail }}" style="color: #0891b2; text-decoration: none;">{{ $senderEmail }}</a>
        </p>
    </div>

    <div style="background-color: #ffffff; border-left: 4px solid #0891b2; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
        <h2 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; font-family: 'Inter', Arial, sans-serif;">
            Message
        </h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; font-family: 'Inter', Arial, sans-serif; white-space: pre-wrap;">{{ $messageContent }}</p>
    </div>

    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0; font-family: 'Inter', Arial, sans-serif; font-style: italic;">
        To reply to this support request, simply reply to this email. Your response will be sent directly to {{ $senderEmail }}.
    </p>
@endsection
