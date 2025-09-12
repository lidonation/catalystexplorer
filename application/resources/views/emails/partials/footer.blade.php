{{-- resources/views/emails/partials/footer.blade.php --}}
<tr>
    <td class="footer">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; text-align: center;">
            <tr>
                <td align="center" style="padding: 10px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" style="display: inline-table;">
                        <tr>
                            <td style="padding: 5px; display: inline-block;">
                                @include('emails.components.button', [
                                    'url' => route('proposals.index'),
                                    'text' => __('emails.footer.proposals'),
                                    'color' => '#0891b2',
                                    'preset' => 'footer',
                                    'style' => 'display: inline-block; margin: 0; padding: 8px 16px;'
                                ])
                            </td>
                            
                            <td style="padding: 5px; display: inline-block;">
                                @include('emails.components.button', [
                                    'url' => route('funds.index'),
                                    'text' => __('emails.footer.funds'),
                                    'color' => '#0891b2',
                                    'preset' => 'footer',
                                    'style' => 'display: inline-block; margin: 0; padding: 8px 16px;'
                                ])
                            </td>
                            
                            <td style="padding: 5px; display: inline-block;">
                                @include('emails.components.button', [
                                    'url' => route('completedProjectsNfts.index'),
                                    'text' => __('emails.footer.completion_nfts'),
                                    'color' => '#0891b2',
                                    'preset' => 'footer',
                                    'style' => 'display: inline-block; margin: 0; padding: 8px 16px;'
                                ])
                            </td>
                            
                            <td style="padding: 5px; display: inline-block;">
                                @include('emails.components.button', [
                                    'url' => url(app()->getLocale() . '/my/dashboard'),
                                    'text' => __('emails.footer.catalyst_numbers'),
                                    'color' => '#0891b2',
                                    'preset' => 'footer',
                                    'style' => 'display: inline-block; margin: 0; padding: 8px 16px;'
                                ])
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
        @if(isset($footerContent))
        <div class="footer-custom-content" style="text-align: center; padding: 10px 0; color: #6b7280; font-size: 14px;">
            {!! Illuminate\Mail\Markdown::parse($footerContent) !!}
        </div>
        @endif
        
        <div class="footer-text" style="text-align: center; padding: 20px 0 10px 0;">
            @php
                $userEmail = 'your email';
                if (isset($user)) {
                    if (is_object($user) && method_exists($user, 'getAttribute')) {
                        $userEmail = $user->getAttribute('email') ?: 'your email';
                    } elseif (is_object($user) && isset($user->email)) {
                        $userEmail = $user->email ?: 'your email';
                    } elseif (is_array($user) && isset($user['email'])) {
                        $userEmail = $user['email'] ?: 'your email';
                    }
                }
            @endphp
            
            <span style="color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.5;">
                @if(isset($unsubscribeText))
                    {!! Illuminate\Mail\Markdown::parse($unsubscribeText) !!}
                @else
                    {{-- {!! Illuminate\Mail\Markdown::parse(__('emails.footer.unsubscribe_text_part_1')) !!}{{ $userEmail }}{!! Illuminate\Mail\Markdown::parse(__('emails.footer.unsubscribe_text_part_2')) !!} --}}
                    {!! Illuminate\Mail\Markdown::parse(__('emails.footer.unsubscribe_text', ['email' => $userEmail])) !!}
                @endif
            </span>
        </div>
        
        <?php 
            $imageUrl = public_path('img/catalyst-explorer-icon.png');
            $message->embed($imageUrl, 'Catalyst Explorer Logo');
        ?>
        <div style="text-align: center; padding: 10px 0;">
            <img src="{{ $message->embed($imageUrl) }}" alt="Catalyst Explorer Logo"/>
        </div>
    </td>
</tr>   