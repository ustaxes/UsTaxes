FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Install tsx globally for running TypeScript
RUN npm install -g tsx

# Expose HTTP port
EXPOSE 3000

# Run HTTP server
CMD ["npm", "run", "start:http"]
