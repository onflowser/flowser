# flowser
Flowser is Flow Browser. Visit the online [documentation page](https://www.notion.so/Engineering-Wiki-07b2d4453ce24a70804e7b50b5045b6d)

### Requirements
- Docker
- Node.js

### Development

Application stack consist of frontend Nestjs backend API server, frontend React SPA application and Mongo database.
Use the following docker-compose commands to start up development stack and point your browser to http://localhost:3000

Make sure that you have ```.env``` file properly configured, for local development simply rename .env.sample to .env!

To get more information on frontend and backend respectively refer to README.md in /frontend and /backend folders.



Start local development stack. 
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

#### Connect to Mongo Docker instance with your local machine client ([example Robo 3T](https://robomongo.org/))
Connect MongoDb Client using settings in ```.env``` file. Bellow example from ```.env.sample```. Keep in mind that
in docker-compose.yml we mapped port 27017 to 27016, use ````localhost```` instead of ```database``` docker-compose internal
host name
```
mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@localhost:27016/${MONGODB_DATABASE}

mongodb://root:rootpassword@localhost:27016/flowser
```




### Development important notes:

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

### Production
TODO


