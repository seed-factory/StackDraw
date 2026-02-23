# Production image - uses pre-built files
# Build locally first with: npm run build:lib && npm run build:app
FROM node:22-alpine

# Install nginx and git
RUN apk add --no-cache nginx git

# Copy backend code
COPY packages/fossflow-backend /app/packages/fossflow-backend

# Copy the pre-built React app to Nginx's web server directory
COPY packages/fossflow-app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create data directory for persistent storage
RUN mkdir -p /data/diagrams

# Expose ports
EXPOSE 80 3001

# Environment variables with defaults
ENV ENABLE_SERVER_STORAGE=true
ENV STORAGE_PATH=/data/diagrams
ENV BACKEND_PORT=3001
ENV ENABLE_GIT_BACKUP=true

# Start services
ENTRYPOINT ["/docker-entrypoint.sh"]