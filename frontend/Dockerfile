# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

# VITE_API_URL is baked into the bundle at build time by Vite.
# Pass it with: docker build --build-arg VITE_API_URL=https://api.example.com
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---- Runtime stage ----
# Pin to a specific nginx minor version — never use :latest in production images.
FROM nginx:1.27-alpine

# Create a non-root user. nginx listens on port 8080 (see nginx.conf) so no
# CAP_NET_BIND_SERVICE is needed.
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Grant the app user write access to every path nginx writes at runtime.
RUN chown -R app:app /usr/share/nginx/html \
    && chown -R app:app /var/cache/nginx \
    && chown -R app:app /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown app:app /var/run/nginx.pid

USER app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8080/ || exit 1
