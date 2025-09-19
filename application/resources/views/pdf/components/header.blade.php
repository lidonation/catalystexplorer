<!-- Header -->
<div class="document-header">
    <div class="header-content">
        <div class="title-section">
            <h1>{{ $title ?? $bookmarkCollection->title ?? __('pdf.header.defaultTitle') }}</h1>
            <p>{{ $subtitle ?? __('pdf.header.defaultSubtitle') }}</p>
        </div>
        <div class="logo-section" style="float: right; width: 200px; text-align: right;">
            <div style="width: 180px; height: 60px; display: inline-block; background: transparent; position: relative;">
                <img src="data:image/png;base64,{{ $catalystHeaderLogo }}" 
                     alt="Catalyst Explorer" 
                     style="
                         position: absolute;
                         top: 0;
                         right: 0;
                         width: 180px !important;
                         height: 60px !important;
                         object-fit: contain !important;
                         object-position: right center !important;
                         image-rendering: -webkit-optimize-contrast !important;
                         image-rendering: crisp-edges !important;
                     " />
            </div>
        </div>
    </div>
</div>

<style>
.document-header .logo-section {
    float: right !important;
    width: 200px !important;
    text-align: right !important;
}

.document-header .logo-section img {
    width: 180px !important;
    height: 60px !important;
    object-fit: contain !important;
    object-position: right center !important;
    max-width: none !important;
    min-width: 180px !important;
    display: block !important;
    margin-left: auto !important;
}

.document-header .title-section {
    float: left !important;
    width: calc(100% - 220px) !important;
}
</style>