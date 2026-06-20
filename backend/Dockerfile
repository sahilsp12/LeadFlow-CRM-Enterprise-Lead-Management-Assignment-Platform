# Use Alpine-based Node image for production efficiency
FROM node:18-alpine

# Define working directory
WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose backend service port
EXPOSE 5000

# Set production environment variables
ENV NODE_ENV=production

# Start Express server
CMD ["node", "server.js"]
