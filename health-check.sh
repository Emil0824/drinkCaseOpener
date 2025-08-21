#!/bin/bash

# Health check script for Drink Case Opener
# Run this to verify all services are running correctly

echo "🏥 Health Check - Drink Case Opener"
echo "=================================="

# Check if containers are running
echo "📦 Container Status:"
docker-compose ps

echo ""
echo "🌐 Service Health Checks:"

# Check API health
echo -n "API Service: "
if curl -f -s http://localhost/api/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Check frontend
echo -n "Frontend Service: "
if curl -f -s http://localhost > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

echo ""
echo "💾 Disk Usage:"
df -h | grep -E "/$|/var"

echo ""
echo "🐳 Docker Stats (5 second snapshot):"
timeout 5 docker stats --no-stream

echo ""
echo "📜 Recent Logs (last 10 lines):"
echo "--- API Logs ---"
docker-compose logs --tail=10 api

echo "--- Web Logs ---"  
docker-compose logs --tail=10 web
