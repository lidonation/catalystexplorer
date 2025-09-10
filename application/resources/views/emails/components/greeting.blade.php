{{-- resources/views/emails/components/greeting.blade.php --}}
<div class="text greeting">
    @if(isset($content))
        {!! Illuminate\Mail\Markdown::parse($content) !!}
    @else
        Hello{{ !empty($user->name ?? '') ? ', ' . ($user->name ?? '') : '' }}!
    @endif
</div>