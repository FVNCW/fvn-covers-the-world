FROM node:24-alpine

COPY . /app
WORKDIR /app
RUN npm i -g bun
RUN bun i

ENTRYPOINT [ "./scripts/app.sh" ]
