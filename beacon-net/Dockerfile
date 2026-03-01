# Build stage
FROM node:18-alpine AS build

# allow overriding the API base URL at build time
ARG VITE_API_BASE_URL
# set a default in case nothing is provided; Vite will expose this as
# import.meta.env.VITE_API_BASE_URL when building
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8000}

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
# make sure the .env file is part of the context (it's not ignored) so
# Vite can pick up the value during the build step
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
