FROM node:16-alpine3.11 AS development

WORKDIR /app

# install flow-cli
# TODO: test for "aarch64" architecture when support is added
RUN apk update
RUN apk upgrade
RUN apk --no-cache add curl
RUN sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
RUN export PATH="$PATH:/root/.local/bin"

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:16-alpine3.11 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# install flow-cli
# TODO: test for "aarch64" architecture when support is added
RUN apk update
RUN apk upgrade
RUN apk --no-cache add curl
RUN sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
RUN export PATH="$PATH:/root/.local/bin"

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /dist ./dist

CMD ["node", "dist/main"]
