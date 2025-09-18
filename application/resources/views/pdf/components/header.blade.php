<!-- Header -->
<div class="document-header">
    <div class="header-content">
        <div class="title-section">
            <h1>{{ $title ?? $bookmarkCollection->title ?? __('pdf.header.defaultTitle') }}</h1>
            <p>{{ $subtitle ?? __('pdf.header.defaultSubtitle') }}</p>
        </div>
        <div class="logo-section">
            <img src="data:image/png;base64,{{ $catalystHeaderLogo }}" alt="Catalyst Explorer" />
        </div>
    </div>
</div>