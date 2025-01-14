FROM node:18
WORKDIR /app
COPY apigateway.js .
COPY package.json ./
RUN npm init -y && npm install
EXPOSE 8197
CMD ["node", "apigateway.js"]
