FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency configs
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source code
COPY src ./src

# Default environment configurations
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run entry point
CMD ["npm", "start"]
