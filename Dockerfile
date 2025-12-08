FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
COPY frontend/ ./frontend/
EXPOSE 3000
CMD ["node", "server.js"]