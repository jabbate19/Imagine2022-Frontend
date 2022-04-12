FROM node:14
WORKDIR /usr/sentinelsecurity/
COPY package*.json ./
RUN npm install
COPY ["LICENSE", "./tsconfig.json", ".env", "./"]
COPY "./src" "./src"
COPY "./public" "./public"
EXPOSE 3000
CMD [ "npm", "start" ]
