FROM ubuntu:20.04 AS development

WORKDIR /app

RUN apt-get update
RUN apt-get -yq install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get -yq install nodejs
RUN npm install
RUN curl https://storage.googleapis.com/flow-cli/install.sh > /tmp/install.sh
RUN sh /tmp/install.sh v0.28.3 # version v0.28.4 breaks storage script logic
ENV PATH="$PATH:/root/.local/bin:/app/data-storage"

COPY package*.json ./

RUN npm install --silent glob rimraf
RUN npm install --only=development

COPY . .

RUN npm run build

CMD ["npm", "run", "start:debug"]
