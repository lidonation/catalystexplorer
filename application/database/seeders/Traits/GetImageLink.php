<?php

declare(strict_types=1);

namespace Database\Seeders\Traits;

trait GetImageLink
{
    /** @throws \Exception */
    public function getRandomImageLink(int $width = 640, int $height = 480): null|string
    {
        $url = "https://picsum.photos/{$width}/{$height}";

        $headers = get_headers($url, true);

        if ($headers && isset($headers['Content-Type']) && str_contains($headers['Content-Type'], 'image')) {
            return $url;
        }

        return null;
    }
}
