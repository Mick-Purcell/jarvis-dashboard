# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy and install frontend deps
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY api/package*.json ./api/
RUN cd api && npm install --production && cd ..
COPY api ./api

# Copy built frontend into backend's static path
COPY --from=builder /app/dist ./dist

ENV PORT=3000
ENV STATIC_PATH=./dist

EXPOSE 3000

CMD ["node", "api/server.js"]
