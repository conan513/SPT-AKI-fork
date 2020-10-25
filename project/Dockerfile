FROM node:12.18.2-alpine3.11

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY app/ ./app
COPY packages/ ./packages

EXPOSE 443

CMD ["node", "app/main.js"]