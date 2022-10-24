FROM node:alpine

WORKDIR /Desktop/DiscordBot-v14
COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "./src/index.js"]