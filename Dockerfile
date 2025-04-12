FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

# Start the NestJS app
CMD ["npm", "run", "start:dev"]
