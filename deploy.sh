#!/bin/bash

# Deployment script for Drink Case Opener
# Run this script on your Ubuntu server

echo "🚀 Deploying Drink Case Opener..."

# Pull latest changes (if using git)
# git pull origin main

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Remove old images (optional, uncomment to clean up)
# docker system prune -f
# docker image prune -f

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Show container status
echo "📋 Container status:"
docker-compose ps

# Show logs
echo "📜 Starting log tail (Ctrl+C to exit):"
docker-compose logs -f

echo "✅ Deployment complete!"
echo "🌐 Your application should be available at: https://drink.emilshome.com"
