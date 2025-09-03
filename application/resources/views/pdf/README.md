# PDF Layout System

This directory contains a reusable PDF layout system for generating professional documents using `spatie/laravel-pdf` with Tailwind CSS integration.

## Structure

```
pdf/
├── layout.blade.php           # Main layout template
├── components/
│   ├── header.blade.php      # Reusable header component
│   └── footer.blade.php      # Reusable footer component
├── sample-document.blade.php # Example usage
└── README.md                 # This documentation

resources/scss/
└── pdf.scss                   # PDF-specific CSS that extends Tailwind
```


## Tailwind Integration

This PDF layout system leverages your existing Tailwind CSS configuration, providing:

### Benefits
- **Consistency**: Same design tokens and utilities as your web application
- **Maintainability**: Single source of truth for design system
- **Developer Experience**: Familiar utility classes and patterns
- **Customization**: Full access to your custom Tailwind configuration

### How It Works
1. **Main Styling**: Uses standard Tailwind utility classes for layout, typography, spacing, and colors
2. **PDF-Specific CSS**: `resources/scss/pdf.scss` handles PDF-only features like:
   - `@page` rules for page size and margins
   - Print media queries
   - Running headers and footers
   - Page break controls
   - Font fallbacks for PDF generation

### Custom PDF Utilities
The `pdf.scss` file includes custom utilities that extend Tailwind:
```scss
.pdf-table { @apply w-full border-collapse border border-gray-300; }
.logo-placeholder { @apply flex h-10 w-20 items-center justify-center rounded border border-gray-300 bg-gray-100; }
.document-section { @apply mb-6; }
```

## Quick Start

### 1. Create a New PDF Document

Create a new Blade view file in the `pdf/` directory:

```blade
@extends('pdf.layout', [
    'title' => 'Your Document Title',
    'subtitle' => 'Optional Subtitle',
    'company' => 'Your Company Name',
    'website' => 'https://yoursite.com',
    'email' => 'contact@yoursite.com'
])

@section('content')
    <h1>Your Content Here</h1>
    <p>This is your document content...</p>
@endsection
```

### 2. Generate PDF in Controller

```php
use Spatie\LaravelPdf\Facades\Pdf;

public function generatePdf()
{
    $pdf = Pdf::view('pdf.your-document')
        ->format('A4')
        ->margins(15, 10, 15, 10);
    
    return $pdf->download('document.pdf');
    // or return $pdf->stream('document.pdf');
}
```

## Layout Parameters

The main layout accepts the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'Document Title' | Main document title |
| `subtitle` | string | '' | Optional subtitle |
| `date` | string | Current date | Document date |
| `reference` | string | null | Document reference number |
| `version` | string | null | Document version |
| `logo` | boolean | true | Show/hide logo |
| `company` | string | config('app.name') | Company name |
| `website` | string | config('app.url') | Company website |
| `email` | string | config('mail.from.address') | Contact email |
| `address` | string | null | Company address |
| `confidential` | boolean | false | Show confidential notice |
| `show_page_numbers` | boolean | true | Show/hide page numbers |
| `generated_at` | string | Current timestamp | Custom generation timestamp |

## Header Component

The header component displays:
- Logo placeholder (customizable)
- Document title and subtitle
- Document metadata (date, reference, version)

### Customizing the Logo

Replace the logo placeholder in `components/header.blade.php`:

```blade
<div class="logo">
    <img src="{{ asset('images/logo.png') }}" alt="Company Logo" style="height: 40px;">
</div>
```

## Footer Component

The footer component includes:
- Company information
- Copyright notice
- Page numbering
- Generation timestamp
- Optional confidential notice

## Styling

### Available Utility Classes

**Text Alignment:**
- `.text-center`, `.text-right`, `.text-left`

**Typography:**
- `.font-bold`, `.font-italic`
- `.text-sm`, `.text-xs`

**Colors:**
- `.text-primary`, `.text-success`, `.text-warning`, `.text-danger`, `.text-muted`
- `.bg-light`, `.bg-primary`, `.bg-success`, `.bg-warning`, `.bg-danger`

**Spacing:**
- `.mb-1`, `.mb-2`, `.mb-3`, `.mb-4` (margin-bottom)
- `.mt-1`, `.mt-2`, `.mt-3`, `.mt-4` (margin-top)
- `.p-1`, `.p-2`, `.p-3`, `.p-4` (padding)

**Page Control:**
- `.page-break` - Force page break before element
- `.page-break-inside-avoid` - Prevent page breaks inside element

### Custom Styles

Add custom styles using the `@push('styles')` directive:

```blade
@push('styles')
<style>
    .custom-class {
        color: #333;
        margin: 10px 0;
    }
</style>
@endpush
```

## Advanced Usage

### Multiple Page Documents

For documents spanning multiple pages, use the `.page-break` class:

```blade
<div class="section-1">
    <h1>Section 1</h1>
    <!-- content -->
</div>

<div class="page-break"></div>

<div class="section-2">
    <h1>Section 2</h1>
    <!-- content -->
</div>
```

### Tables

Tables are automatically styled for PDF output:

```blade
<table>
    <thead>
        <tr>
            <th>Header 1</th>
            <th>Header 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </tbody>
</table>
```

### Avoiding Page Breaks

Use `.page-break-inside-avoid` to keep content together:

```blade
<div class="page-break-inside-avoid">
    <h3>Important Section</h3>
    <p>This content will stay together on the same page.</p>
</div>
```

## Best Practices

1. **Keep It Simple**: Avoid complex CSS that might not render well in PDF
2. **Test Thoroughly**: Always test PDF output with your specific content
3. **Use Web Fonts Carefully**: Stick to system fonts for best compatibility
4. **Optimize Images**: Use optimized images for faster PDF generation
5. **Page Breaks**: Use page break classes strategically for better layout
6. **Print Testing**: Test actual printing if PDFs will be printed

## Troubleshooting

### Common Issues

**Fonts not rendering:**
- Use web-safe fonts or ensure custom fonts are properly loaded
- The default font stack includes 'DejaVu Sans', 'Helvetica', 'Arial'

**Page breaks not working:**
- Ensure you're using the correct CSS page-break properties
- Some complex layouts may require manual adjustment

**Content overflow:**
- Use appropriate margins and padding
- Consider responsive text sizing for different page formats

## Examples

See `sample-document.blade.php` for a comprehensive example showing all features and usage patterns.

## Requirements

- Laravel 8+
- spatie/laravel-pdf package
- PHP 8.0+

## Contributing

When modifying the PDF layout system:

1. Test with multiple document types
2. Ensure backward compatibility
3. Update documentation
4. Test PDF generation and printing
5. Verify cross-browser consistency for web previews
