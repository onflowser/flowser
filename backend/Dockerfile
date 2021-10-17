FROM node:16-alpine3.11 AS development

WORKDIR /app

# install flow-cli
# TODO: replace temporary flow-cli install script with official file
# when arm64-darwin support is added
RUN apk update
RUN apk upgrade
RUN apk --no-cache add curl
RUN sh -ci "$(curl -fsSL https://raw.githubusercontent.com/bartolomej/flowser/emulator_service/backend/install-flow-cli.sh?token=AITP5A22WKLNGLLTRLEUTF3BORQGU)"


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
# TODO: replace temporary flow-cli install script with official file
# when arm64-darwin support is added
RUN apk update
RUN apk upgrade
RUN apk --no-cache add curl
RUN sh -ci "$(curl -fsSL https://raw.githubusercontent.com/bartolomej/flowser/emulator_service/backend/install-flow-cli.sh?token=AITP5A22WKLNGLLTRLEUTF3BORQGU)"


COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /dist ./dist

CMD ["node", "dist/main"]
