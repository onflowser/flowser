FROM ubuntu:latest AS development

WORKDIR /app

# install flow-cli
# TODO: test for "aarch64" architecture when support is added

RUN apt-get update
RUN apt-get -yq install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get -yq install nodejs
#RUN apt-get -yq install npm
RUN npm install
RUN sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
ENV PATH="$PATH:/root/.local/bin"

COPY package*.json ./

RUN npm install --silent glob rimraf
RUN npm install --only=development

COPY . .

RUN npm run build

FROM ubuntu:20.04 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

## install flow-cli
## TODO: test for "aarch64" architecture when support is added
RUN apt-get update
RUN apt-get -yq install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get -yq install nodejs
#RUN apt-get -yq install npm
RUN npm install
RUN sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
ENV PATH="$PATH:/root/.local/bin"

COPY package*.json ./

RUN npm install --silent glob rimraf
RUN npm install --only=development

COPY . .

COPY --from=development /dist ./dist

CMD ["node", "dist/main"]
