FROM ubuntu:latest AS development

WORKDIR /app

RUN apt-get update
RUN apt-get -yq install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get -yq install nodejs
RUN npm install
RUN sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
ENV PATH="$PATH:/root/.local/bin:/app/data-storage"

COPY package*.json ./

RUN npm install --silent glob rimraf
RUN npm install --only=development

COPY . .

RUN npm run build

FROM ubuntu:20.04 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN apt-get update
RUN apt-get -yq install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get -yq install nodejs
RUN npm install
RUN sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
ENV PATH="$PATH:/root/.local/bin:/app/data-storage"

COPY package*.json ./

RUN npm install --silent glob rimraf
RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/main"]
