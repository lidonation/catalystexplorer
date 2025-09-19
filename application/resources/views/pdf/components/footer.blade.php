<!-- Footer -->
<div class="document-footer">
    <div class="footer-content">
        <p>{{ __('pdf.footer.generatedWith') }} <span class="footer-text" target="_blank">{{ $generatorName ?? __('pdf.footer.defaultGeneratorName') }}</span>.</p>
        <p>{{ __('pdf.footer.visit') }} <a href="{{ $websiteUrl ?? 'http://catalystexplorer.com' }}" class="footer-link">{{ str_replace(['https://', 'http://'], '', $websiteUrl ?? 'catalystexplorer.com') }}</a></p>
        <p class="footer-date">{{ $footerMessage ?? __('pdf.footer.defaultMessage') }} · {{ now()->format('n/j/Y') }}</p>
        <!-- Footer logo -->
        <div style="display: block; text-align: center; margin-top: 8px;">
            <img src="data:image/png;base64,{{ $catalystFooterLogo }}" alt="Catalyst Explorer" style="height: 24px; width: auto; display: inline-block;" />
        </div>
    </div>
</div>