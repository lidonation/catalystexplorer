<?php

declare(strict_types=1);

namespace App\Services\Providers;

use App\Contracts\ProvidesModelExportService;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportModelProviderService implements ProvidesModelExportService
{
    public function __construct(protected $exportObj) {}

    /**
     * Export model
     *
     * @param  string  $exportFileName  - naming of the generated file in any format
     */
    public function export(string $exportFileName): BinaryFileResponse
    {
        return Excel::download($this->exportObj, $exportFileName);
    }
}
