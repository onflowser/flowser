FROM ubuntu:20:04 AS development

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

CMD ["npm", "run", "start:debug"]
