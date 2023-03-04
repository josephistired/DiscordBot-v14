FROM node:latest

RUN mkdir -p /bot/discordbot-v14

WORKDIR /bot/discordbot-v14

COPY . .

RUN rm -rf node_modules
RUN npm install

CMD ["npm", "start"]