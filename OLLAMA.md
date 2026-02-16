# Ollama AI Setup for CatalystExplorer

Documentation for Ollama integration setup for the CatalystChatbox agent using the llama3.3:70b model.

## Overview

The CatalystChatbox agent (`application/app/Agents/CatalystChatbox.php`) is configured to use Ollama with the llama3.3:70b model for local AI processing. This setup provides:

- Local AI processing (no external API dependencies)
- High-performance llama3.3:70b model optimized for chat interactions
- Full control over AI processing and data privacy
- Integration with the Vizra ADK framework

## Configuration

### Docker Services

The `catalystexplorer.ollama` service is configured in `docker-compose.yml`:

```yaml
catalystexplorer.ollama:
  image: ollama/ollama:0.6.2
  container_name: catalystexplorer.ollama
  ports:
    - "${FORWARD_OLLAMA_PORT:-11434}:11434"
  volumes:
    - "catalystexplorer-ollama:/root/.ollama"
    - "./docker/scripts/ollama-init.sh:/ollama-init.sh"
  environment:
    - OLLAMA_KEEP_ALIVE=24h
    - OLLAMA_HOST=0.0.0.0
  restart: unless-stopped
```

### Environment Variables

The following variables are configured in `application/.env`:

```env
# Ollama AI Configuration
OLLAMA_HOST=http://catalystexplorer.ollama:11434
OLLAMA_MODEL=llama3.3:70b
OLLAMA_TIMEOUT=300
FORWARD_OLLAMA_PORT=11434
```

### Vizra ADK Configuration

The Ollama provider is configured in `application/config/vizra-adk.php`:

```php
'default_provider' => env('VIZRA_ADK_DEFAULT_PROVIDER', 'ollama'),
'default_model' => env('VIZRA_ADK_DEFAULT_MODEL', 'llama3.3:70b'),

'providers' => [
    'ollama' => [
        'base_url' => env('OLLAMA_HOST', 'http://catalystexplorer.ollama:11434'),
        'timeout' => env('OLLAMA_TIMEOUT', 300),
        'keep_alive' => env('OLLAMA_KEEP_ALIVE', '24h'),
    ],
    // ... other providers
],
```

### Agent Configuration

The CatalystChatbox agent is configured to use the Ollama model:

```php
protected string $model = 'ollama:llama3.3:70b';
protected string $description = 'AI assistant for Project Catalyst community, providing help with proposals, funding, and community resources.';
```

## Setup Instructions

### 1. Initial Setup

Start the Docker services including Ollama:

```bash
make up
```

### 2. Pull the Model

Pull the llama3.3:70b model (this may take some time depending on your internet connection):

```bash
make ollama-pull
```

Alternatively, you can initialize using the setup script:

```bash
make ollama-init
```

### 3. Verify Installation

Check that the model is available:

```bash
make ollama-status
```

You should see `llama3.3:70b` in the list of available models.

### 4. Test the Setup

Run the test script to verify everything is working:

```bash
php test_ollama_setup.php
```

## Available Make Commands

The following Makefile commands are available for managing Ollama:

- `make ollama-pull` - Pull the llama3.3:70b model
- `make ollama-init` - Initialize Ollama with the model using the setup script
- `make ollama-status` - Check Ollama status and list available models
- `make ollama-shell` - Open a shell in the Ollama container
- `make ollama-logs` - Show Ollama container logs
- `make ollama-chat` - Start an interactive chat session with the model
- `make ollama-restart` - Restart the Ollama service

## Usage

### Direct Agent Usage

```php
use App\Agents\CatalystChatbox;
use Vizra\VizraADK\System\AgentContext;

$agent = new CatalystChatbox();
$context = new AgentContext();

$response = $agent->prompt("How do I create a Project Catalyst proposal?", $context);
echo $response;
```

### Via Web Interface

The agent can be accessed through the Vizra ADK web interface at `/vizra` (if enabled in configuration).

### Via API

The agent is accessible via the OpenAI-compatible API endpoint at `/api/vizra-adk/chat/completions`.

## Troubleshooting

### Common Issues

1. **Model not found error**
   ```bash
   make ollama-pull
   make ollama-status
   ```

2. **Connection timeout**
   - Check if Ollama service is running: `docker-compose ps`
   - Check logs: `make ollama-logs`
   - Restart service: `make ollama-restart`

3. **Out of memory errors**
   - The llama3.3:70b model requires significant RAM (recommended: 64GB+)
   - Consider using a smaller model like `llama3.1:8b` for development

4. **Slow responses**
   - Ensure adequate system resources (CPU, RAM)
   - Consider using GPU acceleration if available
   - Adjust `OLLAMA_KEEP_ALIVE` to keep models in memory longer

### Performance Optimization

1. **GPU Acceleration**: If you have a compatible GPU, Ollama will automatically use it
2. **Memory Management**: The model stays in memory for 24 hours (`OLLAMA_KEEP_ALIVE=24h`)
3. **Concurrent Requests**: Ollama can handle multiple concurrent requests efficiently

### Model Alternatives

If llama3.3:70b is too resource-intensive, consider these alternatives:

- `llama3.3:8b` - Smaller, faster model
- `llama3.1:8b` - Proven stable model
- `phi3:medium` - Efficient smaller model
- `codellama:13b` - Code-focused model

To change models, update the configuration and pull the new model:

```bash
# Update .env
OLLAMA_MODEL=llama3.1:8b

# Pull new model
docker-compose exec catalystexplorer.ollama ollama pull llama3.1:8b

# Update agent model in CatalystChatbox.php
protected string $model = 'ollama:llama3.1:8b';
```

## Security Considerations

- Ollama runs locally within the Docker network, no external API calls
- Model weights are stored in the `catalystexplorer-ollama` Docker volume
- All AI processing happens on your infrastructure
- No data is sent to external services

## Resource Requirements

### Minimum Requirements

- **CPU**: 4+ cores
- **RAM**: 32GB (for llama3.3:70b)
- **Storage**: 50GB for model weights
- **Network**: Good internet connection for initial model download

### Recommended Requirements

- **CPU**: 8+ cores
- **RAM**: 64GB+
- **GPU**: NVIDIA GPU with 24GB+ VRAM (optional, for acceleration)
- **Storage**: SSD with 100GB+ free space

## Monitoring and Maintenance

### Health Checks

The Ollama service includes health checks that verify the service is responding:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:11434/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Log Monitoring

Monitor Ollama logs for issues:

```bash
make ollama-logs
```

### Volume Management

Model weights are stored in the `catalystexplorer-ollama` volume. To reset:

```bash
docker volume rm catalystexplorer-ollama
make ollama-pull  # Re-download models
```