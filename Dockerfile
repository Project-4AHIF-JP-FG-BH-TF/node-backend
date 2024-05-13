FROM node:22-alpine
RUN apk add --no-cache python3 make xz build-base

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
