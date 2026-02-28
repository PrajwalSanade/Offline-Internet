# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Remove default nginx index
RUN rm -rf /usr/share/nginx/html/*
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
