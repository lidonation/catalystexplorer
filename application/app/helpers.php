<?php

use App\DataTransferObjects\ProposalData;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Fluent;

if (! function_exists('to_length_aware_paginator')) {
    function to_review_item($items) {}
}

if (! function_exists('to_length_aware_paginator')) {
    function to_length_aware_paginator($items, $total = null, $perPage = null, $currentPage = null): LengthAwarePaginator|AbstractPaginator
    {
        if ($items instanceof Paginator) {
            $total = $items->total();
            $perPage = $items->perPage();
            $currentPage = $items->currentPage();
            $items = $items->items();
        } elseif (! $items instanceof Collection) {
            $items = ProposalData::collect($items);
        }

        // Set default values to prevent division by zero
        $total = $total ?? count($items);
        $perPage = $perPage ?? 15; // Default per page
        $currentPage = $currentPage ?? 1; // Default current page

        $pagination = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $currentPage,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1);
    }

    function toFluentDeep(array $array): Fluent
    {
        $result = [];

        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $result[$key] = toFluentDeep($value);
            } else {
                $result[$key] = $value;
            }
        }

        return new Fluent($result);
    }
}

if (! function_exists('format_short_number')) {
    /**
     * Format large numbers with k, M suffixes like in the frontend
     *
     * @param  mixed  $number
     * @param  int  $decimals
     */
    function format_short_number($number, $decimals = 1): string
    {
        if (! is_numeric($number)) {
            return '0';
        }

        $number = (float) $number;

        if ($number >= 1000000000) {
            return round($number / 1000000000, $decimals).'B';
        } elseif ($number >= 1000000) {
            return round($number / 1000000, $decimals).'M';
        } elseif ($number >= 1000) {
            return round($number / 1000, $decimals).'k';
        }

        return number_format($number, 0);
    }
}

if (! function_exists('format_currency_short')) {
    /**
     * Format currency amounts with k/M suffixes
     *
     * @param  mixed  $amount
     */
    function format_currency_short($amount, string $currency = 'ADA', int $decimals = 1): string
    {
        if (! is_numeric($amount)) {
            return '–';
        }

        $formatted = format_short_number($amount, $decimals);

        return $formatted.' '.$currency;
    }
}

/**
 * Format status text by replacing underscores with spaces and capitalizing words
 */
if (! function_exists('formatStatusText')) {
    function formatStatusText($text)
    {
        if (empty($text) || $text === '–') {
            return '–';
        }

        // Convert to string if it's not already
        $text = (string) $text;

        // Replace underscores with spaces and convert to title case
        return ucwords(str_replace('_', ' ', $text));
    }
}

/**
 * Format any column value that might contain underscores or need formatting
 */
if (! function_exists('formatColumnValue')) {
    function formatColumnValue($value)
    {
        if (empty($value)) {
            return '–';
        }

        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }

        if (is_numeric($value)) {
            return format_short_number($value, 0);
        }

        if (is_array($value)) {
            return implode(', ', array_filter($value));
        }

        $stringValue = (string) $value;

        // Check if it looks like a status/enum value (contains underscores, lowercase)
        if (strpos($stringValue, '_') !== false && strtolower($stringValue) === $stringValue) {
            return formatStatusText($stringValue);
        }

        return $stringValue;
    }
}

/**
 * Convert image URL to base64 for PDF rendering
 */
if (! function_exists('getBase64Image')) {
    function getBase64Image($imageUrl)
    {
        if (empty($imageUrl)) {
            return null;
        }

        // Convert relative URLs to absolute URLs
        if (strpos($imageUrl, 'http') !== 0) {
            $baseUrl = config('app.url', 'https://catalystexplorer.com');
            $imageUrl = rtrim($baseUrl, '/').'/'.ltrim($imageUrl, '/');
        }

        try {
            // Create a context with proper headers and timeout
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'user_agent' => 'Mozilla/5.0 (compatible; CatalystExplorer/1.0; +https://catalystexplorer.com)',
                    'follow_location' => true,
                    'max_redirects' => 3,
                    'ignore_errors' => false,
                    'header' => [
                        'Accept: image/*,*/*;q=0.8',
                        'Accept-Language: en-US,en;q=0.5',
                        'Accept-Encoding: identity',
                        'Connection: close',
                    ],
                ],
                'https' => [
                    'timeout' => 10,
                    'user_agent' => 'Mozilla/5.0 (compatible; CatalystExplorer/1.0; +https://catalystexplorer.com)',
                    'follow_location' => true,
                    'max_redirects' => 3,
                    'verify_peer' => false,
                    'verify_host' => false,
                    'ignore_errors' => false,
                    'header' => [
                        'Accept: image/*,*/*;q=0.8',
                        'Accept-Language: en-US,en;q=0.5',
                        'Accept-Encoding: identity',
                        'Connection: close',
                    ],
                ],
            ]);

            // Try to get the image data directly
            $imageData = @file_get_contents($imageUrl, false, $context);
            if ($imageData === false || strlen($imageData) === 0) {
                return null;
            }

            // Detect MIME type
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($imageData);

            // If MIME detection fails, try to determine type from URL extension
            if (strpos($mimeType, 'image/') !== 0) {
                $extension = strtolower(pathinfo($imageUrl, PATHINFO_EXTENSION));
                $extensionMimeMap = [
                    'jpg' => 'image/jpeg',
                    'jpeg' => 'image/jpeg',
                    'png' => 'image/png',
                    'gif' => 'image/gif',
                    'webp' => 'image/webp',
                    'svg' => 'image/svg+xml',
                ];

                if (isset($extensionMimeMap[$extension])) {
                    $mimeType = $extensionMimeMap[$extension];
                } else {
                    return null;
                }
            }

            return 'data:'.$mimeType.';base64,'.base64_encode($imageData);
        } catch (Exception $e) {
            return null;
        }
    }
}
