#!/bin/bash

command=${1}

if [ -z "${command}" ]; then
cat << EOF
Available flowser commands:
  - start
  - stop
  - logs

Example usage: bash run.sh start
EOF
elif [ "$command" == "start" ]; then
    echo -e "Starting flowser in production...\n"
    docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d
elif [ "$command" == "stop" ]; then
    echo -e "Stopping flowser in production...\n"
    docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml down
elif [ "$command" == "logs" ]; then
    docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml logs -f
else
    echo "Unsupported flowser command: ${command}"
    exit 1
fi
