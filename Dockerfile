FROM node:12-alpine

WORKDIR /usr/app

COPY package.json yarn.lock ./
RUN yarn

COPY . .

CMD ["yarn", "dev:server"]
