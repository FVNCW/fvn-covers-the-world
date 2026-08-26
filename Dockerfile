FROM node:24-alpine

COPY . /app
WORKDIR /app
RUN npm i -g bun
RUN bun i
RUN chmod +x ./scripts/app.sh

ENTRYPOINT ["sh","./scripts/app.sh"]
