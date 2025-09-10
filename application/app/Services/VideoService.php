<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Intergrations\Vimeo\Requests\GetVideoDetailsRequest as VimeoVideoDetailsRequest;
use App\Http\Intergrations\YouTube\Requests\GetVideoDetailsRequest as YouTubeVideoDetailsRequest;
use Exception;
use Illuminate\Support\Facades\Log;

class VideoService
{
    /**
     * Extract video ID and duration from a YouTube or Vimeo URL
     */
    public function getVideoMetadata(string $url): array
    {
        $videoId = $this->extractVideoId($url);

        if (! $videoId) {
            throw new Exception('Invalid video URL');
        }

        $platform = $this->detectPlatform($url);

        switch ($platform) {
            case 'youtube':
                return $this->getYouTubeMetadata($videoId);
            case 'vimeo':
                return $this->getVimeoMetadata($videoId);
            default:
                throw new Exception('Unsupported video platform');
        }
    }

    /**
     * Extract video ID from URL
     */
    private function extractVideoId(string $url): ?string
    {
        // YouTube patterns
        $youtubePatterns = [
            '/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/',
        ];

        foreach ($youtubePatterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        // Vimeo patterns
        $vimeoPatterns = [
            '/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/',
        ];

        foreach ($vimeoPatterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Detect video platform from URL
     */
    private function detectPlatform(string $url): ?string
    {
        if (preg_match('/(?:youtube\.com|youtu\.be)/', $url)) {
            return 'youtube';
        }

        if (preg_match('/vimeo\.com/', $url)) {
            return 'vimeo';
        }

        return null;
    }

    /**
     * Get YouTube video metadata
     */
    private function getYouTubeMetadata(string $videoId): array
    {
        try {
            $request = new YouTubeVideoDetailsRequest($videoId);
            $response = $request->send();

            if (! $response->successful()) {
                throw new Exception('Failed to fetch YouTube video details: '.$response->body());
            }

            $data = $response->json();

            if (empty($data['items'])) {
                throw new Exception('YouTube video not found');
            }

            $video = $data['items'][0];
            $duration = $this->parseYouTubeDuration($video['contentDetails']['duration'] ?? null);

            return [
                'platform' => 'youtube',
                'video_id' => $videoId,
                'title' => $video['snippet']['title'] ?? null,
                'duration' => $duration,
                'thumbnail' => $video['snippet']['thumbnails']['default']['url'] ?? null,
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch YouTube video metadata', [
                'video_id' => $videoId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Get Vimeo video metadata
     */
    private function getVimeoMetadata(string $videoId): array
    {
        try {
            $request = new VimeoVideoDetailsRequest($videoId);
            $response = $request->send();

            if (! $response->successful()) {
                throw new Exception('Failed to fetch Vimeo video details: '.$response->body());
            }

            $data = $response->json();

            return [
                'platform' => 'vimeo',
                'video_id' => $videoId,
                'title' => $data['name'] ?? null,
                'duration' => $data['duration'] ?? null,
                'thumbnail' => null, // Could be added if needed
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch Vimeo video metadata', [
                'video_id' => $videoId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Parse YouTube duration format (PT4M13S) to seconds
     */
    private function parseYouTubeDuration(?string $duration): ?int
    {
        if (! $duration) {
            return null;
        }

        // YouTube uses ISO 8601 duration format: PT4M13S
        $pattern = '/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/';

        if (preg_match($pattern, $duration, $matches)) {
            $hours = (int) ($matches[1] ?? 0);
            $minutes = (int) ($matches[2] ?? 0);
            $seconds = (int) ($matches[3] ?? 0);

            return ($hours * 3600) + ($minutes * 60) + $seconds;
        }

        return null;
    }

    /**
     * Normalize YouTube URL to youtu.be format
     */
    public function normalizeYouTubeUrl(string $url): string
    {
        $videoId = $this->extractVideoId($url);
        $platform = $this->detectPlatform($url);

        if ($platform === 'youtube' && $videoId) {
            return "https://youtu.be/{$videoId}";
        }

        return $url;
    }
}
