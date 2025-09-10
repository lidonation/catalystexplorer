<?php 
    $imageUrl = public_path('img/catalyst-logo-dark-CZiPVQ7x.png');
    $message->embed($imageUrl, 'Catalyst Explorer Logo');
?>

<div class="logo-container">
    <img src="{{ $message->embed($imageUrl) }}" alt="Catalyst Explorer Logo" class="logo-img"/>
</div>

@if(isset($headerContent))
<div class="header-content" style="text-align: center; margin-bottom: 20px; color: #6b7280; font-size: 14px;">
    {!! Illuminate\Mail\Markdown::parse($headerContent) !!}
</div>
@endif
