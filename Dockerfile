FROM node:21

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000

#Launch the app
CMD ["sh", "-c", "yarn prisma migrate reset --force && yarn start:prod"]
