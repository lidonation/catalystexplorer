@extends('pdf.layout', [
    'title' => 'Catalyst Explorer Document',
    'subtitle' => 'Demonstration of PDF Layout',
    'date' => now()->format('F j, Y'),
    'reference' => 'DOC-001',
    'version' => '1.0',
    'company' => 'Catalyst Explorer',
    'website' => 'https://www.catalystexplorer.com',
    'email' => 'hello@catalystexplorer.com',
    'address' => '123 Business St, Suite 100, City, State 12345',
    'confidential' => false,
    'show_page_numbers' => true
])

@section('content')
    <div class="document-section">
        <h1 class="text-xl font-bold text-slate-700 mb-3">Introduction</h1>
        <p class="mb-3 text-justify">
            This is a sample document demonstrating the use of the PDF layout system with Tailwind CSS.
            The layout includes a professional header with logo placeholder, document title,
            and metadata, as well as a comprehensive footer with company information and page numbering.
        </p>
    </div>

    <div class="document-section">
        <h2 class="text-lg font-bold text-slate-700 mb-3">Features</h2>
        <p class="mb-3">The PDF layout system provides the following features:</p>

        <ul class="ml-5 mb-3 list-disc space-y-1">
            <li>Responsive header with logo, title, and document metadata</li>
            <li>Professional footer with company information and page numbers</li>
            <li>Tailwind CSS for consistent styling</li>
            <li>Print-friendly styling with proper page breaks</li>
            <li>PDF-specific CSS for advanced features</li>
            <li>Reusable components for consistency</li>
        </ul>
    </div>

    <div class="document-section">
        <h2 class="text-lg font-bold text-slate-700 mb-3">Sample Table</h2>
        <p class="mb-3">Here's an example of a table with proper PDF styling using Tailwind classes:</p>

        <table class="pdf-table mt-2">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Product A</td>
                    <td>High-quality product with excellent features</td>
                    <td class="text-center">2</td>
                    <td class="text-right">$25.00</td>
                    <td class="text-right">$50.00</td>
                </tr>
                <tr>
                    <td>Product B</td>
                    <td>Premium service package</td>
                    <td class="text-center">1</td>
                    <td class="text-right">$100.00</td>
                    <td class="text-right">$100.00</td>
                </tr>
                <tr>
                    <td>Product C</td>
                    <td>Additional components and accessories</td>
                    <td class="text-center">3</td>
                    <td class="text-right">$15.00</td>
                    <td class="text-right">$45.00</td>
                </tr>
            </tbody>
            <tfoot>
                <tr class="bg-gray-100">
                    <th colspan="4" class="text-right font-bold">Total:</th>
                    <th class="text-right font-bold">$195.00</th>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="document-section">
        <h2 class="text-lg font-bold text-slate-700 mb-3">Text Formatting</h2>
        <p class="mb-3">The layout supports various Tailwind text formatting options:</p>

        <div class="space-y-2">
            <p><span class="font-bold">Bold text</span> using <code class="bg-gray-100 px-1 py-0.5 rounded">font-bold</code></p>
            <p><span class="italic">Italic text</span> using <code class="bg-gray-100 px-1 py-0.5 rounded">italic</code></p>
            <p><span class="text-blue-600">Blue colored text</span> using <code class="bg-gray-100 px-1 py-0.5 rounded">text-blue-600</code></p>
            <p><span class="text-green-600">Success colored text</span> using <code class="bg-gray-100 px-1 py-0.5 rounded">text-green-600</code></p>
            <p><span class="text-amber-600">Warning colored text</span> using <code class="bg-gray-100 px-1 py-0.5 rounded">text-amber-600</code></p>
            <p><span class="text-red-600">Danger colored text</span> using <code class="bg-gray-100 px-1 py-0.5 rounded">text-red-600</code></p>
            <p><span class="text-gray-500">Muted text</span> using <code class="bg-gray-100 px-1 py-0.5 rounded">text-gray-500</code></p>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="document-section">
        <h1 class="text-xl font-bold text-slate-700 mb-3">Page 2: Extended Content</h1>
        <p class="mb-3">This content appears on page 2 to demonstrate page breaks and consistent header/footer styling across multiple pages.</p>

        <div class="bg-gray-50 p-3 mt-3 rounded border">
            <h3 class="text-base font-bold text-slate-700 mb-2">Highlighted Section</h3>
            <p>This is a highlighted section with a light background to demonstrate background styling in PDF generation using Tailwind classes.</p>
        </div>

        <h3 class="text-base font-bold text-slate-700 mt-4 mb-2">Ordered List Example</h3>
        <ol class="ml-5 list-decimal space-y-1">
            <li>First item in the ordered list</li>
            <li>Second item with more detailed description that might wrap to multiple lines to show proper line spacing</li>
            <li>Third item in the list</li>
            <li>Fourth item to complete the demonstration</li>
        </ol>

        <h3 class="text-base font-bold text-slate-700 mt-4 mb-2">Custom Spacing with Tailwind</h3>
        <p class="mb-1">This paragraph has minimal bottom margin using <code class="bg-gray-100 px-1 py-0.5 rounded">mb-1</code></p>
        <p class="mb-4">This paragraph has large bottom margin using <code class="bg-gray-100 px-1 py-0.5 rounded">mb-4</code></p>
        <p class="mt-4">This paragraph has large top margin using <code class="bg-gray-100 px-1 py-0.5 rounded">mt-4</code></p>
    </div>

    <div class="document-section">
        <h2 class="text-lg font-bold text-slate-700 mb-3">Usage Instructions</h2>
        <p class="mb-3">To use this updated PDF layout system with Tailwind CSS in your Laravel application:</p>

        <div class="page-break-inside-avoid">
            <h3 class="text-base font-bold text-slate-700 mb-2">1. Include CSS Files</h3>
            <p class="mb-2">Make sure your PDF views include the compiled Tailwind CSS and PDF-specific styles:</p>
            <div class="bg-gray-100 p-3 rounded text-sm font-mono">
                @@vite(['resources/scss/app.scss', 'resources/scss/pdf.scss'])
            </div>
        </div>

        <div class="page-break-inside-avoid mt-4">
            <h3 class="text-base font-bold text-slate-700 mb-2">2. Extend the Layout</h3>
            <p class="mb-2">Create a new Blade view and extend the PDF layout:</p>
            <div class="bg-gray-100 p-3 rounded text-sm font-mono leading-relaxed">
                @@extends('pdf.layout', [<br>
                &nbsp;&nbsp;&nbsp;&nbsp;'title' => 'Your Document Title',<br>
                &nbsp;&nbsp;&nbsp;&nbsp;'subtitle' => 'Optional Subtitle',<br>
                &nbsp;&nbsp;&nbsp;&nbsp;'company' => 'Your Company Name'<br>
                ])
            </div>
        </div>

        <div class="page-break-inside-avoid mt-4">
            <h3 class="text-base font-bold text-slate-700 mb-2">3. Add Content with Tailwind</h3>
            <p class="mb-2">Use Tailwind classes in your content section:</p>
            <div class="bg-gray-100 p-3 rounded text-sm font-mono leading-relaxed">
                @@section('content')<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&lt;h1 class="text-xl font-bold mb-3"&gt;Title&lt;/h1&gt;<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&lt;p class="mb-3"&gt;Your content...&lt;/p&gt;<br>
                @@endsection
            </div>
        </div>

        <div class="page-break-inside-avoid mt-4">
            <h3 class="text-base font-bold text-slate-700 mb-2">4. Generate PDF</h3>
            <p class="mb-2">In your controller, use spatie/laravel-pdf to generate the PDF:</p>
            <div class="bg-gray-100 p-3 rounded text-sm font-mono leading-relaxed">
                use Spatie\LaravelPdf\Facades\Pdf;<br><br>

                $pdf = Pdf::view('pdf.your-document')<br>
                &nbsp;&nbsp;&nbsp;&nbsp;->format('A4')<br>
                &nbsp;&nbsp;&nbsp;&nbsp;->margins(15, 10, 15, 10);<br><br>

                return $pdf->download('document.pdf');
            </div>
        </div>

        <div class="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
            <p class="text-sm"><strong>Note:</strong> This system now uses Tailwind CSS for most styling, with a dedicated PDF-specific SCSS file for features that can't be handled by Tailwind (like @page rules and print-specific CSS).</p>
        </div>
    </div>
@endsection
