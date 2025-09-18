<!-- Footer -->
<div class="document-footer">
    <div class="footer-content">
        <p>{{ __('pdf.footer.generatedWith') }} <span class="footer-text" target="_blank">{{ $generatorName ?? __('pdf.footer.defaultGeneratorName') }}</span>.</p>
        <p>{{ __('pdf.footer.visit') }} <a href="{{ $websiteUrl ?? 'https://catalystexplorer.com' }}" class="footer-link" target="_blank">{{ $websiteUrl ?? 'catalystexplorer.com' }}</a></p>
        <p class="footer-date">{{ $footerMessage ?? __('pdf.footer.defaultMessage') }} · {{ now()->format('n/j/Y') }}</p>
        <!-- Footer logo -->
        <img src="data:image/png;base64,{{ $catalystFooterLogo }}" alt="Catalyst Explorer" style="margin-top: 8px; height: 24px; width: auto;" />
    </div>
</div>