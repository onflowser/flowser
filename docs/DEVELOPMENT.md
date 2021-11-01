# Development Guide

Flowser application stack consist of frontend Nestjs backend API server, frontend React SPA application and Mongo database.

### 1. Requirements
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Docker](https://docs.docker.com/get-docker/)
- [docker compose](https://docs.docker.com/compose/install/)
- [Flow cli](https://docs.onflow.org/flow-cli/) (optional)

### 2. Configure environment
Make sure that you have `.env` file properly configured, for local development simply rename .env.sample to .env!

To get more information on frontend and backend respectively refer to [`frontend/README`](../frontend/README.md) and [`backend/README`](../backend/README.md) readmes.

### 3. Start local development stack
```
docker-compose up -d
```

Stop local development stack.
```
docker-compose down
```

See logs.
```
docker-compose logs -f
```

### 4. View flowser

Once docker-compose successfully started all services (`backend`, `frontend`, `database` and `dev-wallet`), 
you can visit [localhost:3000](http://localhost:3000) to view flowser UI.

### 5. Additional tooling

You can use [Robo 3T](https://robomongo.org/) mongodb client app to inspect, debug and edit flowser database.

Connect to Mongo Docker instance with your local machine client using settings in `.env` file. 
Bellow example from `.env.sample`. Keep in mind that
in docker-compose.yml we mapped port 27017 to 27016, use ````localhost```` instead of ```database``` docker-compose internal
host name:
```
mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@localhost:27016/${MONGODB_DATABASE}

mongodb://root:rootpassword@localhost:27016/flowser
```




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
