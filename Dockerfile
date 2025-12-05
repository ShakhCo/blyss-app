FROM node:22-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

EXPOSE 7005
CMD ["npm", "run", "preview", "--", "--port", "7005", "--host"]
