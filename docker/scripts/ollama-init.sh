#!/bin/bash

# Ollama initialization script
# This script ensures the llama3.3:70b model is available in the container

set -e

echo "Starting Ollama initialization..."

# Wait for Ollama service to be ready
echo "Waiting for Ollama service to start..."
until curl -s http://localhost:11434/api/health >/dev/null 2>&1; do
    echo "Ollama service not ready, waiting..."
    sleep 5
done

echo "Ollama service is ready!"

# Check if the model is already pulled
if ollama list | grep -q "llama3.3:70b"; then
    echo "Model llama3.3:70b is already available"
else
    echo "Pulling llama3.3:70b model... This may take a while depending on your internet connection."
    ollama pull llama3.3:70b
    echo "Model llama3.3:70b successfully pulled!"
fi

echo "Ollama initialization completed!"