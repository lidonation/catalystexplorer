<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\Providers\ExportModelProviderService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportModelService
{
    /**
     * Export model
     *
     * @param  string  $exportFileName  - naming of the generated file in any format eg 'proposal.csv' or 'proposal.xlsx'
     */
    public function exportExcel($exportObj, string $exportFileName): BinaryFileResponse
    {
        $exportName = $exportFileName.'.xlsx';

        return (new ExportModelProviderService($exportObj))->export($exportName);
    }

    public function export($exportObj, string $exportFileName): BinaryFileResponse
    {
        return (new ExportModelProviderService($exportObj))->export($exportFileName);
    }
}
