# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Build-time configuration (React embeds these at build time)
ARG REACT_APP_API_BASE_URL=http://localhost:8070
ARG REACT_APP_GOOGLE_MAPS_API_KEY=
ARG REACT_APP_TURNSTILE_SITE_KEY=
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY
ENV REACT_APP_TURNSTILE_SITE_KEY=$REACT_APP_TURNSTILE_SITE_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
