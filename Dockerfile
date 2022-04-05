FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY ["./src", "./public", "LICENSE", ".env", "./"]
COPY ./public ./public
COPY ./tsconfig.json ./tsconfig.json
EXPOSE 3000
CMD [ "npm", "start" ]
