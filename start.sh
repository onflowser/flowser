#!/bin/bash

environment=${1:-dev}

if [ "$environment" == "dev" ]; then
    echo -e "Starting flowser in development...\n"
    docker-compose --env-file .env.sample up -d
elif [ "$environment" == "prod" ]; then
      echo -e "Starting flowser in production...\n"
    docker-compose --env-file .env.sample -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    echo "Unsupported environment: ${environment}"
    exit 1
fi
