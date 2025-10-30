# Multi-stage build for React app
FROM node:18-alpine as client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install MySQL client
RUN apk add --no-cache mysql-client

# Copy server files
COPY package*.json ./
RUN npm ci --only=production

# Copy built React app
COPY --from=client-build /app/client/build ./client/build

# Copy server files
COPY server.js ./
COPY config.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5001

CMD ["node", "server.js"]