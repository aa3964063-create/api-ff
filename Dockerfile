FROM ghcr.io/puppeteer/puppeteer:latest

# Directorio de la app
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Iniciar la API
CMD ["node", "index.js"]
