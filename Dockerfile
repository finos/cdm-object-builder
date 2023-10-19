FROM node:20-alpine

RUN mkdir -p /app
WORKDIR /app
COPY ./ui/ /app
EXPOSE 80
RUN npm install
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=0 /app/dist/* /usr/share/nginx/html
