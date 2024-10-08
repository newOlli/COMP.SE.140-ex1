FROM node:18
WORKDIR /app
COPY service1.js .
RUN npm init -y && npm install
EXPOSE 8199
CMD ["node", "service1.js"]
