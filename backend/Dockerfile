FROM node:16-alpine3.11 AS development

WORKDIR /app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

# install flow-cli
# TODO: replace temporary flow-cli install script with official file
# when arm64-darwin support is added
RUN sh -ci "$(wget https://raw.githubusercontent.com/bartolomej/flowser/emulator_service/backend/install-flow-cli.sh?token=AITP5A22WKLNGLLTRLEUTF3BORQGU -qO /dev/stdout)"

COPY . .

RUN npm run build

FROM node:16-alpine3.11 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

# install flow-cli
# TODO: replace temporary flow-cli install script with official file
# when arm64-darwin support is added
RUN sh -ci "$(wget https://raw.githubusercontent.com/bartolomej/flowser/emulator_service/backend/install-flow-cli.sh?token=AITP5A22WKLNGLLTRLEUTF3BORQGU -qO /dev/stdout)"

COPY . .

COPY --from=development /dist ./dist

CMD ["node", "dist/main"]
