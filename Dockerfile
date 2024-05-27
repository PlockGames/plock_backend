FROM node:21

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .

RUN yarn prisma generate

EXPOSE 3000

CMD ["yarn", "start:dev"]