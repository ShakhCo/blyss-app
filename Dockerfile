FROM node:22-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

ENV PORT=7005
EXPOSE 7005
CMD ["npm", "run", "start"]
