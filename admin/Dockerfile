# ---- Stage 1: build the static files with Node ----
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes this value into the JavaScript at BUILD time (not at runtime).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: serve the result with nginx (tiny final image) ----
# Node and node_modules are NOT copied over, so the final image is ~25 MB.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
