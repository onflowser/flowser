# TODO: set alpine ubuntu x86 as base image
FROM node:16-alpine3.11 AS development

WORKDIR /app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

# install flow-cli
RUN sh -ci "$(wget https://storage.googleapis.com/flow-cli/install.sh -qO /dev/stdout)"

COPY . .

RUN npm run build

# TODO: set alpine ubuntu x86 as base image
FROM node:16-alpine3.11 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /dist ./dist

CMD ["node", "dist/main"]
