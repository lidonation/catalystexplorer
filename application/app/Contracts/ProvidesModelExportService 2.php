<?php

declare(strict_types=1);

namespace App\Contracts;

interface ProvidesModelExportService
{
    /**
     * Export model
     *
     * @param  string  $exportFileName  - naming of the generated file in any format
     */
    public function export(string $exportFileName);
}
