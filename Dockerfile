# Use official Node.js LTS image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set environment variable placeholder (can be overridden at runtime)
ENV GEMINI_API_KEY=""

# Start the Next.js app in production
CMD ["npm", "start"]
