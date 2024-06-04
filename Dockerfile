FROM node:21

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "yarn prisma migrate reset --force && yarn run start:dev"]
