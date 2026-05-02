FROM node:20-alpine AS build
WORKDIR /app

ARG BASE_HREF=/

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx ng build --base-href $BASE_HREF

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend-saludo/browser /usr/share/nginx/html

EXPOSE 80