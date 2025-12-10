# YouTube API Integration with Caching
Pretty much every youtube api request should be cache. See below for deets.

## Configuration

### Cache Driver
- **Driver**: `LaravelCacheDriver`
- **TTL**: 4 hours (14,400 seconds)

### Cache Keys
- Video details: `youtube_video_details_{videoId}`
- All other requests: `youtube_api:` + SHA-256 hash (32 chars) of endpoint + query parameters

## Usage

### Basic Usage (Recommended)

```php
use App\Http\Integrations\YouTube\Requests\GetVideoDetailsRequest;

// Create and send request - caching is automatic
$request = new GetVideoDetailsRequest('your-video-id');
$response = $request->send();
$data = $response->json(); // Cached for 4 hours
```

### Cache Management
```php
use App\Http\Intergrations\YouTube\Examples\YouTubeUsageExample;

// Check if video is cached
$isCached = YouTubeUsageExample::isVideoCached('video-id');

// Clear cache for specific video
YouTubeUsageExample::clearVideoCache('video-id');

// Force refresh cache
$freshData = YouTubeUsageExample::refreshVideoCache('video-id');

// Warm up cache for multiple videos
$results = YouTubeUsageExample::warmUpCache(['video1', 'video2', 'video3']);
```

### Cache Inspection
```php
// Get detailed cache information
$result = YouTubeUsageExample::getVideoDetailsWithCacheInfo('video-id');
/*
Returns:
{
    "data": {...}, // YouTube API response
    "cache_info": {
        "was_cached": true,
        "cache_key": "youtube_video_details_abc123",
        "cache_expires_at": "2024-01-01T16:00:00Z"
    }
}
*/
```

## Monitoring
Check cache performance:
```bash
php artisan tinker
>>> Cache::get('youtube_video_details_YOUR_VIDEO_ID');
```

## Configuration Changes

To modify cache behavior:

### Change TTL
```php
// In GetVideoDetailsRequest.php
public function cacheExpiryInSeconds(): int
{
    return 7200; // 2 hours instead of 4
}
```

### Disable Caching
Remove the `Cacheable` interface and `HasCaching` trait from the request class.

### Custom Cache Keys
Override the `cacheKey()` method in your request classes.
