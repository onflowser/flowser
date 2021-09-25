# flowser
Flowser is Flow Browser. TODO: Add description
### Requirements
- Docker
- Node.js

### Development

Local development stack consist of frontend Nestjs application and frontend React application.
Each of the two is run in a separate Docker container. Use the following docker-compose commands
to start up development stack and point your browser to http://localhost:3000

Make sure that you have .env file properly configured, for local development simply rename .env.sample to .env!

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

### Production
TODO


