# 🚀 Docker Deployment Guide

This guide will help you deploy the Drink Case Opener application on your Ubuntu server using Docker and Portainer.

## 📋 Prerequisites

Your Ubuntu server should have:
- ✅ Docker installed
- ✅ Docker Compose installed  
- ✅ Portainer running
- ✅ Nginx running (for reverse proxy)

## 📦 Deployment Steps

### 1. Transfer Files to Server

Upload the entire project directory to your Ubuntu server. You can use:
- SCP: `scp -r ./drinkCaseOpener user@your-server:/path/to/deployment/`
- Git clone (if you have a repository)
- FTP/SFTP client

### 2. Configure Environment

```bash
# Navigate to project directory
cd /path/to/drinkCaseOpener

# Copy and edit environment file
cp .env.production .env
nano .env  # Edit with your specific configuration
```

### 3. Configure External Nginx

Add the configuration from `nginx-external-config.conf` to your existing nginx server through your web GUI.

### 4. Deploy with Docker Compose

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:
```bash
# Build and start containers
docker-compose up -d --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Access Your Application

- **Frontend**: http://your-server-ip or http://your-domain.com
- **API Health Check**: http://your-server-ip/api/health

## 🐳 Container Architecture

The deployment includes 2 containers:

1. **drink-case-api** (Backend)
   - Node.js + Express server
   - Handles API requests and drink data
   - Port: 3000 (exposed)

2. **drink-case-web** (Frontend)
   - Vue.js application built with Vite
   - Served by internal Nginx
   - Port: 5050 (exposed)

**Note**: This setup uses your existing nginx server for reverse proxy instead of a containerized nginx.

## 🔧 Management Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Check container status
docker-compose ps

# Access container shell
docker-compose exec [service-name] sh
```

## 📊 Using Portainer

If you prefer using Portainer's web interface:

1. Open Portainer in your browser
2. Go to "Stacks"
3. Click "Add Stack"
4. Name it "drink-case-opener"
5. Copy the contents of `docker-compose.yml`
6. Click "Deploy the stack"

## 🔍 Troubleshooting

### Check Container Logs
```bash
docker-compose logs api    # Backend logs
docker-compose logs web    # Frontend logs  
docker-compose logs nginx  # Nginx logs
```

### Check Container Health
```bash
# API health check
curl http://localhost/api/health

# Check all containers
docker-compose ps
```

### Restart Specific Service
```bash
docker-compose restart api
docker-compose restart web
docker-compose restart nginx
```

## 🔒 SSL/HTTPS Setup (Optional)

To enable HTTPS:

1. Get SSL certificates (Let's Encrypt recommended)
2. Place certificates in `nginx/ssl/` directory
3. Uncomment HTTPS server block in `nginx/conf.d/default.conf`
4. Update domain names in the configuration
5. Restart containers: `docker-compose restart nginx`

## 🗄️ Data Persistence

- Drink data is stored in `server/data/` directory
- This directory is mounted as a volume for persistence
- Backup this directory regularly

## 🔄 Updates

To update the application:

1. Pull new code changes
2. Run: `docker-compose down && docker-compose up -d --build`
3. Check logs: `docker-compose logs -f`

## 📈 Monitoring

You can monitor the application through:
- Portainer web interface
- Docker logs: `docker-compose logs -f`
- Health check endpoint: `/api/health`
- System resources: `docker stats`
