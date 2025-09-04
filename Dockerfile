# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create app user for security (but run as root for NAS compatibility)
# RUN addgroup -g 1001 -S appgroup && \
#     adduser -S appuser -u 1001 -G appgroup

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (use npm install if package-lock.json not available)
RUN if [ -f package-lock.json ]; then \
        npm ci --omit=dev; \
    else \
        npm install --omit=dev; \
    fi && \
    npm cache clean --force

# Copy application files
COPY server/ ./server/
COPY client/ ./client/

# Create data directory with proper permissions
RUN mkdir -p /app/data

# Note: Running as root for NAS volume compatibility
# USER appuser

# Expose the port
EXPOSE 3001

# Set environment variables for container mode
ENV NODE_ENV=production
ENV NAS_MODE=true
ENV HOST=0.0.0.0
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

# Start the application
CMD ["node", "server/index.js"]
