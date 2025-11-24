FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Установим все зависимости включая devDependencies
RUN npm install --legacy-peer-deps

COPY . .

# Проверяем локально установлен ли vite
RUN ls node_modules/.bin

CMD ["npm", "run", "dev", "--", "--host"]
