FROM node:24-alpine

COPY . /app
WORKDIR /app
RUN npm i -g bun
RUN bun i
RUN bun run push --force

ENTRYPOINT [ "bun", "start" ]
