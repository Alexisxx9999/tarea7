# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm ci --only=production

# Copia el resto del código
COPY . .

# Expone el puerto (ajusta según tu aplicación)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]