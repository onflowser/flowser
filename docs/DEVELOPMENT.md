# Development Guide

Flowser application stack consist of frontend Nestjs backend API server, frontend React SPA application and Mongo database.

> Check out [ARCHITECTURE.md](./ARCHITECTURE.md) for a quick overview of Flowser high-level architecture.

## Requirements
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Docker](https://docs.docker.com/get-docker/)
- [docker compose](https://docs.docker.com/compose/install/)
- [Flow cli](https://docs.onflow.org/flow-cli/) (optional)

## Get started

### 1. Clone the repo

```
git clone https://github.com/onflowser/flowser
```

### 2. Install required dependencies

To leverage the power of your favourite IDEs code completion & indexing features, as well as static code analysis with eslint, install required dependencies with `bootstrap` command (must be run from project root).
```
cd flowser && npm run bootstrap
```

### 3. Configuration

There is no need to configure development environment to get started, as Flowser uses default configuration defined in `.env.dev`. 

However, if you want to use custom configuration, you can do so by defining a separate environment file (e.g. `.env.local`) and use `.env.sample` as a template.

### 4. Run in development

To start the Flowser app in development mode, run `dev:start` command from project root. This will pull all 3rd party docker images to your local machine, build flowser images and start all application containers.

```
npm run dev:start
```

### 5. View flowser app

Good job! This is the last step, before we can actually start making code changes. Now the app should be running, you can test that by visiting http://localhost:3000.

> NOTE: If something isn't working as expected, try running `npm run dev:logs` to view logs from all containers or [submit a bug report](https://github.com/onflowser/flowser/issues/new?assignees=bartolomej&labels=bug%2C+feedback&template=bug_report.md&title=).


## Advanced configuration

If you want to use custom configuration, you can do so by defining a separate environment file (e.g. `.env.local`) and use `.env.sample` as a template.

You can then start the application by running `docker-compose up` command, like so:

```
docker-compose \
    --env-file <path-to-custom-env-file> \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    up -d
```

To stop local development stack.
```
docker-compose \
    --env-file <path-to-custom-env-file> \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    down
```

To see logs from all containers, run:
```
docker-compose \
    --env-file <path-to-custom-env-file> \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    logs
```

## Additional tooling

### MongoDB client

You can use [Robo 3T](https://robomongo.org/) mongodb client app to inspect, debug and edit flowser database.

Connect to Mongo Docker instance with your local machine client using settings in `.env.*` file that was used for startup - use variables in `.env.dev` if you used `dev:start` command.

> Keep in mind that in docker-compose.yml we mapped port 27017 to 27016, use ````localhost```` instead of ```database``` docker-compose internal host name:
```
mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@localhost:27016/${MONGODB_DATABASE}

mongodb://root:rootpassword@localhost:27016/flowser
```

### REST API client

You can use [Postman](https://postman.com) or [Insomnia](https://insomnia.rest) API clients to debug and test Flowser REST APIs.

> Check out https://github.com/onflowser/flowser#rest-api to learn how to import [OpenAPI](https://www.openapis.org/) API specification to your client of choice.



## Important notes

After installing new NPM library you have to stop docker-compose, remove Docker image, and run docker-compose up again. Below example for frontend:
1. Stop docker-compose
```
docker-copose down
```
2. Remove frontend image:
```
docker image ls
```
example output
```
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
frontend     dev       214591eba110   3 minutes ago    436MB
backend      dev       3a9d55b4f99a   41 minutes ago   419MB
```
remove image (use IMAGE ID)
```
docker image rm 214591eba110
```
3. Start docker-compose
```
docker-comopse up
```
