#!/bin/bash

environment=${1:-prod}

if [ "$environment" == "dev" ]; then
    echo -e "Starting flowser in development...\n"
    docker-compose --env-file .env.dev up --build -d
elif [ "$environment" == "prod" ]; then
      echo -e "Starting flowser in production...\n"
    docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up --build -d
elif [ "$environment" == "hosted" ]; then
      echo -e "Starting flowser for hosting...\n"
    docker-compose --env-file .env.hosted -f docker-compose.yml -f docker-compose.hosted.yml up --build -d
else
    echo "Unsupported environment: ${environment}"
    exit 1
fi
