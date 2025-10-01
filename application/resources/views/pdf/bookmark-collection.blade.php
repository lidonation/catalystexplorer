<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $bookmarkCollection['title'] }}</title>
        @vite(['resources/scss/app.scss', 'resources/scss/pdf.scss'])
        <style>
            body {
                font-family: 
                    'Noto Sans CJK KR', 
                    'Noto Sans CJK SC', 
                    'Noto Sans CJK TC', 
                    'Noto Sans CJK JP', 
                    'Noto Sans CJK HK', 
                    'Noto Sans Ethiopic', 
                    'Noto Serif Ethiopic', 
                    'Noto Sans Arabic', 
                    'Noto Sans', 
                    'WenQuanYi Zen Hei', 
                    'WenQuanYi Micro Hei', 
                    'AR PL UMing CN', 
                    'AR PL UKai CN', 
                    'Arial Unicode MS', 
                    'Microsoft YaHei', 
                    'DejaVu Sans', 
                    'Liberation Sans', 
                    'SimSun', 
                    'Malgun Gothic', 
                    'Hiragino Sans GB', 
                    sans-serif;
                background-color: white;
                color: #1f2937;
                font-size: 14px;
                line-height: 1.5;
                margin: 0;
            }
            
            /* Orientation specific styles */
            @media print {
                @page {
                    margin: 40px 30px;
                    size: {{ $orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait' }};
                }
            }
            
            .document-container {
                max-width: 1200px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            @if(($exportFormat ?? null) === 'png')
                html, body {
                    width: 100%;
                }

                .document-container {
                    max-width: 100%;
                    width: 100%;
                    border-radius: 0;
                    box-shadow: none;
                }

                .table-container {
                    border-left: 0;
                    border-right: 0;
                    border-radius: 0;
                }
            @endif
            
            /* Header Section */
            .document-header {
                background: #ffffff;
                border-bottom: 1px solid #e5e7eb;
                padding: 32px 40px;
            }

            .header-content {
                position: relative;
                width: 100%;
                overflow: hidden; /* Clear floats */
            }
            
            /* Clear floats after header content */
            .header-content::after {
                content: "";
                display: table;
                clear: both;
            }
            
            .title-section {
                float: left;
                width: calc(100% - 120px); /* Leave space for logo */
            }

            .title-section h1 {
                font-size: 23px;
                font-weight: 600;
                font-style: normal;
                line-height: 28px;
                color: #101828;
                margin: 0 0 8px 0;
            }

            .title-section p {
                font-family: 'Noto Sans Ethiopic', 'Noto Serif Ethiopic', 'Noto Sans CJK SC', 'Noto Sans CJK TC', 'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Noto Sans CJK HK', 'Noto Sans Arabic', 'DejaVu Sans', 'Noto Sans', 'Arial Unicode MS', sans-serif;
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 24px;
                color: rgba(16, 24, 40, 0.40);
                margin: 0;
            }

            .logo-section {
                float: right;
                width: 100px;
                text-align: right;
                margin-top: 0; /* Align with title */
            }

            .logo-section img {
                height: 40px;
                width: auto;
                vertical-align: top;
            }
            
            /* Table Section */
            .table-container {
                margin-top: 20px;
                margin-bottom: 20px;
                border: 1px solid #B1E2F0;
                border-radius: 8px;
                overflow: hidden;
                background: white;
            }
            
            .proposal-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 0;
            }
            
            .proposal-table thead {
                background: #B1E2F0;
            }
            
            .proposal-table th {
                padding: 5px 5px;
                text-align: left;
                font-weight: 600;
                font-size: 13px;
                color: #374151;
                border-bottom: 1px solid #B1E2F0;
                white-space: normal;
                word-wrap: break-word;
                overflow-wrap: break-word;
                hyphens: auto;
                line-height: 1.2;
                max-width: 120px;
            }
            
            .proposal-table tbody tr:nth-child(even) {
                background: #f8fafc;
                border-bottom: 1px solid var(--LightMode-Grey-Grey-200, #F1F1F4);
                border-right: 1px solid #B1E2F0;
            }
            
            .proposal-table td {
                padding: 5px 5px;
                vertical-align: top;
                border-bottom: 1px solid #f1f5f9;
                font-size: 13px;
                line-height: 1.4;
                border-right: 1px solid #B1E2F0;
            }
            
            .proposal-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            /* Cell-specific styling */
            .title-cell {
                min-width: 300px;
                max-width: 400px;
            }
            
            .proposal-title {
                font-weight: 600;
                color: #111827;
                line-height: 1.3;
            }
            
            .proposal-excerpt {
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            .budget-cell {
                text-align: right;
                font-weight: 600;
                color: #059669;
                white-space: nowrap;
                min-width: 80px;
            }
            
            .category-cell {
                color: #4b5563;
                font-size: 12px;
                max-width: 150px;
                word-wrap: break-word;
            }
            
            .opensource-cell {
                text-align: center;
                font-weight: 500;
                min-width: 60px;
            }
            
            .teams-cell {
                max-width: 120px;
                position: relative;
            }
            
            .team-avatars {
                display: inline-block;
                vertical-align: middle;
            }
            
            .avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #e5e7eb;
                border: 3px solid white;
                font-size: 12px;
                display: inline-block;
                text-align: center;
                line-height: 26px; /* Center text vertically (32px - 6px border) */
                font-weight: 600;
                color: #374151;
                vertical-align: middle;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                position: relative;
                overflow: hidden;
            }
            
            .avatar:nth-child(1) { z-index: 0; }
            .avatar:nth-child(2) { z-index: 1; margin-left: -14px; }
            .avatar:nth-child(3) { z-index: 2; margin-left: -14px; }
            .avatar:nth-child(4) { z-index: 3; margin-left: -14px; }
            .avatar:nth-child(5) { z-index: 4; margin-left: -14px; }
            
            .avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            
            .team-count {
                background: #3FACD1;
                color: white;
                font-size: 11px;
                font-weight: 600;
                min-width: 32px;
                height: 32px;
                border-radius: 50%;
                display: inline-block;
                text-align: center;
                line-height: 26px;
                margin-left: -12px;
                vertical-align: middle;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                z-index: 5;
                position: relative;
            }
            
            /* Vote cells */
            .votes-cell {
                text-align: right;
                font-weight: 500;
                color: #374151;
                white-space: nowrap;
                min-width: 70px;
            }
            
            .yes-vote { color: #059669; }
            .abstain-vote { color: #d97706; }
            .no-vote { color: #dc2626; }
            
            /* Footer Section */
            .document-footer {
                padding: 24px 40px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer-content {
                text-align: center;
            }
            
            .footer-content p {
                margin: 0 0 8px 0;
                font-size: 12px;
            }
            
            .footer-content p:last-of-type {
                margin-bottom: 0;
            }
            
            .footer-link {
                color: var(--Blue-500, #2596BE);
                font-family: 'Noto Sans Ethiopic', 'Noto Serif Ethiopic', 'Noto Sans CJK SC', 'Noto Sans CJK TC', 'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Noto Sans CJK HK', 'Noto Sans Arabic', 'DejaVu Sans', 'Noto Sans', 'Arial Unicode MS', sans-serif;
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 24.38px;
                text-decoration-line: underline;
                text-decoration-style: solid;
                text-decoration-skip-ink: auto;
                text-decoration-thickness: auto;
                text-underline-offset: auto;
                text-underline-position: from-font;
            }
            
            .footer-link:hover {
                color: #B1E2F0;
                text-decoration: underline;
            }
            
            .footer-date {
                color: #6B6E7E;
                text-align: center;
                font-family: 'Noto Sans Ethiopic', 'Noto Serif Ethiopic', 'Noto Sans CJK SC', 'Noto Sans CJK TC', 'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Noto Sans CJK HK', 'Noto Sans Arabic', 'DejaVu Sans', 'Noto Sans', 'Arial Unicode MS', sans-serif;
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 24.38px;
            }

            .footer-text{
                color: var(--Blue-500, #2596BE);
                font-family: 'Noto Sans Ethiopic', 'Noto Serif Ethiopic', 'Noto Sans CJK SC', 'Noto Sans CJK TC', 'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Noto Sans CJK HK', 'Noto Sans Arabic', 'DejaVu Sans', 'Noto Sans', 'Arial Unicode MS', sans-serif;
                font-size: 14px;
                font-style: normal;
                font-weight: 600;
                line-height: 24.38px;
            }
            
            /* Dynamic column widths based on configuration */
            @foreach($columns as $column)
                @php $config = $columnConfig[$column] ?? [] @endphp
                @if(isset($config['width']))
                    .{{ $column }}-column,
                    .{{ $column }}-cell {
                        width: {{ $config['width'] }}px;
                        max-width: {{ $config['width'] }}px;
                        @if(isset($config['fontSize']))
                            font-size: {{ $config['fontSize'] }} !important;
                        @endif
                        @if(isset($config['truncate']) && $config['truncate'])
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        @endif
                    }
                @endif
            @endforeach
            
            /* Responsive text based on column count */
            @if(count($columns) > 10)
                .proposal-table th,
                .proposal-table td {
                    font-size: 10px !important;
                    padding: 3px 3px;
                    line-height: 1.2;
                }
                .proposal-title {
                    font-size: 10px !important;
                }
            @elseif(count($columns) > 7)
                .proposal-table th,
                .proposal-table td {
                    font-size: 11px !important;
                    padding: 4px 4px;
                    line-height: 1.3;
                }
                .proposal-title {
                    font-size: 11px !important;
                }
            @endif
            
            /* Landscape specific adjustments */
            @if($orientation === 'landscape')
                .document-container {
                    max-width: 100%;
                }
                
                .document-header {
                    padding: 20px 30px;
                }
                
                .title-section h1 {
                    font-size: 20px;
                }
            @endif
            
            /* Responsive adjustments for PDF */
            @media print {
                body {
                    font-size: 12px;
                }
                
                .document-container {
                    box-shadow: none;
                    max-width: 100%;
                }
            }
        </style>
    </head>

    <body>
        <div class="document-container">
            @include('pdf.components.header', [
                'title' => $bookmarkCollection->title,
                'subtitle' => __('pdf.header.defaultSubtitle'),
                'catalystHeaderLogo' => $catalystHeaderLogo
            ])

            @include('pdf.components.body', [
                'columns' => $columns,
                'proposals' => $proposals
            ])

            @include('pdf.components.footer', [
                'generatorName' => __('pdf.footer.defaultGeneratorName'),
                'websiteUrl' => 'http://catalystexplorer.com',
                'footerMessage' => __('pdf.footer.defaultMessage'),
                'catalystFooterLogo' => $catalystFooterLogo
            ])
        </div>
    </body>
</html>
