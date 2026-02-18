<!-- OpenAPI Downloads -->
<section id="downloads" class="mb-12">
    <h2 class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8">
        OpenAPI Downloads
    </h2>
    <p class="text-content mb-6">
        Download machine-readable API specifications and collections for use with various tools and platforms.
    </p>

    <div class="grid md:grid-cols-2 gap-6">
        <!-- OpenAPI Specification -->
        <div class="border border-border-secondary rounded-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-content">OpenAPI Specification</h3>
                    <p class="text-sm text-content">YAML format for use with code generators and tools</p>
                </div>
            </div>
            <p class="text-content mb-4">
                The complete OpenAPI 3.0 specification in YAML format. Import this into tools like Swagger UI, Insomnia, or use it to generate client libraries.
            </p>
            <div class="space-y-3">
                <a
                    href="/docs/openapi.yaml"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    download="catalystexplorer-openapi.yaml"
                >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download OpenAPI YAML
                </a>
                <div class="text-xs text-content">
                    <p><strong>Format:</strong> YAML</p>
                    <p><strong>Version:</strong> OpenAPI 3.0</p>
                    <p><strong>Use with:</strong> Swagger UI, Redoc, code generators</p>
                </div>
            </div>
        </div>

        <!-- Postman Collection -->
        <div class="border border-border-secondary rounded-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-content">Postman Collection</h3>
                    <p class="text-sm text-content">Ready-to-use collection for Postman API testing</p>
                </div>
            </div>
            <p class="text-content mb-4">
                Import this collection into Postman to start testing the CatalystExplorer API immediately. Includes all endpoints with example parameters and responses.
            </p>
            <div class="space-y-3">
                <a
                    href="/docs/collection.json"
                    class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    download="catalystexplorer-postman.json"
                >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download Postman Collection
                </a>
                <div class="text-xs text-content">
                    <p><strong>Format:</strong> JSON</p>
                    <p><strong>Version:</strong> Collection v2.1</p>
                    <p><strong>Use with:</strong> Postman, Newman CLI</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Usage Instructions -->
    <div class="mt-8 p-6 bg-background-darker rounded-lg">
        <h3 class="text-lg font-semibold text-content mb-4">Usage Instructions</h3>
        <div class="grid md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold text-content mb-2">Using the OpenAPI Specification</h4>
                <ol class="text-sm text-content space-y-1 list-decimal list-inside">
                    <li>Download the OpenAPI YAML file</li>
                    <li>Import into your preferred tool (Swagger UI, Insomnia, etc.)</li>
                    <li>Generate client libraries using tools like openapi-generator</li>
                    <li>Use for API documentation and testing</li>
                </ol>
            </div>
            <div>
                <h4 class="font-semibold text-content mb-2">Using the Postman Collection</h4>
                <ol class="text-sm text-content space-y-1 list-decimal list-inside">
                    <li>Download the Postman Collection JSON</li>
                    <li>Import into Postman using File → Import</li>
                    <li>Set up environment variables if needed</li>
                    <li>Start testing API endpoints immediately</li>
                </ol>
            </div>
        </div>
    </div>
</section>
