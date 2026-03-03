FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Copiamos todo, pero el build de abajo sobrescribirá el dist corrupto
COPY . .
RUN npm run build
# Limpiamos para que sea ligero
RUN npm prune --production
ENV PORT=3001
CMD ["node", "dist/main"]
