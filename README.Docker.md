# Docker Deployment Guide

This guide will help you run the entire appointment booking application stack using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+

## Services

The application consists of the following services:

1. **PostgreSQL** - Database server (Port: 5432)
2. **Redis** - Cache and message queue (Port: 6379)
3. **Backend** - Node.js API server (Port: 8000)
4. **Email Worker** - Background worker for sending emails
5. **Frontend** - React application served by Nginx (Port: 3000)

## Quick Start

### 1. Environment Configuration

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

**Important:** Update the following variables in `.env`:

- `POSTGRES_PASSWORD` - Set a strong database password
- `REDIS_PASSWORD` - Set a strong Redis password
- `JWT_SECRET` - Set a strong JWT secret (min 32 characters)
- `EMAIL_USER` - Your SMTP email address
- `EMAIL_PASSWORD` - Your SMTP password (use app password for Gmail)
- `EMAIL_FROM` - Your sender email address

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Access the Application

Once all services are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Health Check:** http://localhost:8000/health

### 4. Database Setup

The database migrations and seed data are automatically applied when the backend starts. If you need to manually run them:

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed

# Reset database (WARNING: This will delete all data!)
docker-compose exec backend npx prisma migrate reset --force
```

## Management Commands

### Service Control

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data!)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# View service status
docker-compose ps

# View resource usage
docker stats
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines of logs
docker-compose logs --tail=100

# Execute commands inside a container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d appointment_booking
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d appointment_booking

# Backup database
docker-compose exec postgres pg_dump -U postgres appointment_booking > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres appointment_booking < backup.sql
```

### Redis Access

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli -a redis123

# Monitor Redis
docker-compose exec redis redis-cli -a redis123 monitor

# Check Redis keys
docker-compose exec redis redis-cli -a redis123 keys '*'
```

## Production Deployment

For production deployments, follow these additional steps:

### 1. Security Hardening

- Generate strong random passwords for all services
- Use environment-specific `.env` files (never commit them to git)
- Enable SSL/TLS for all services
- Configure firewall rules to restrict access

### 2. Reverse Proxy Setup

Use a reverse proxy like Nginx or Traefik for:

- SSL termination
- Load balancing
- Rate limiting
- Security headers

Example Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Monitoring

Consider adding monitoring services:

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  # ... configuration

grafana:
  image: grafana/grafana
  # ... configuration
```

### 4. Backup Strategy

Set up automated backups:

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U postgres appointment_booking > backup_$DATE.sql
```

## Scaling

### Horizontal Scaling

Scale specific services:

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Scale email workers to 2 instances
docker-compose up -d --scale email-worker=2
```

**Note:** You'll need a load balancer in front of the backend instances.

### Vertical Scaling

Adjust resource limits in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "1"
          memory: 1G
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild container
docker-compose up -d --build backend
```

### Database connection issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# Verify connection string
docker-compose exec backend printenv DATABASE_URL

# Test database connection
docker-compose exec postgres pg_isready -U postgres
```

### Redis connection issues

```bash
# Check Redis status
docker-compose exec redis redis-cli -a redis123 ping

# Verify Redis password
docker-compose exec backend printenv REDIS_PASSWORD
```

### Port conflicts

If ports are already in use, change them in `.env`:

```env
POSTGRES_PORT=5433
REDIS_PORT=6380
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

## Development Mode

For development, you can override the compose file:

```bash
# Use docker-compose.dev.yml for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Clean Up

```bash
# Remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove all unused Docker resources
docker system prune -a
```

## Support

For issues and questions:

- Check the logs: `docker-compose logs -f`
- Verify environment variables: `docker-compose config`
- Restart services: `docker-compose restart`
