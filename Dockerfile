FROM node:20

#Set-up Working directory
WORKDIR /usr/src/app

#Copy Code in the  Working directory
COPY . .

#Install of all dependencies
RUN yarn install

#Launch test
RUN yarn build

#Create new user for non root privilege
RUN groupadd -g 10001 nest && \
   useradd -u 10000 -g nest nest \
   && chown -R nest:nest /usr/src/app

#Set nest as user for the app
USER nest:nest

#Explose the port 3000
EXPOSE 80

#Launch the app
CMD ["sh", "-c", "npx prisma migrate deploy && yarn start:prod"]