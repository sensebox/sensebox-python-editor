FROM node:24-alpine AS builder

WORKDIR /app

# Use the npm version required by this project.
RUN npm install --global npm@11.18.0

COPY . .

RUN npm ci
ARG VITE_COMMIT_SHA=local
ENV VITE_COMMIT_SHA=$VITE_COMMIT_SHA
RUN npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
