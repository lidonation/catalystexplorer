<?php

namespace App\Services;

use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class StreamService
{
    protected array $streams = [];

    protected array $subscribers = [];

    public function __construct()
    {
        // Initialize streams registry
    }

    /**
     * Create a new stream or get existing one
     */
    public function stream(string $name): StreamInstance
    {
        if (! isset($this->streams[$name])) {
            $this->streams[$name] = new StreamInstance($name);
        }

        return $this->streams[$name];
    }

    /**
     * Send Server-Sent Events response
     */
    public function sendResponse(string $streamName, callable $dataCallback): Response
    {
        return response()->stream(function () use ($streamName, $dataCallback) {
            // Set SSE headers
            echo 'data: '.json_encode(['type' => 'connected', 'stream' => $streamName])."\n\n";

            if (ob_get_level()) {
                ob_flush();
                flush();
            }

            // Execute the data callback
            $dataCallback($streamName);

            // Send completion signal
            echo 'data: '.json_encode(['type' => 'complete'])."\n\n";

            if (ob_get_level()) {
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/plain',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }

    /**
     * Send a single data chunk
     */
    public function sendData(mixed $data): void
    {
        $json = json_encode($data);
        echo "data: $json\n\n";

        if (ob_get_level()) {
            ob_flush();
            flush();
        }

        // Small delay to prevent overwhelming the client
        usleep(10000); // 10ms
    }

    /**
     * Send multiple data chunks
     */
    public function sendCollection(Collection|array $items): void
    {
        foreach ($items as $item) {
            $this->sendData($item);
        }
    }
}

class StreamInstance
{
    public function __construct(
        protected string $name
    ) {}

    public function getName(): string
    {
        return $this->name;
    }
}
