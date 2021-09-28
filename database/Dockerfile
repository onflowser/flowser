FROM mongo:5.0

# Init and seed database
ADD init-db.sh /docker-entrypoint-initdb.d/
ADD seeds/projects.js /docker-entrypoint-initdb.d/
ADD seeds/blocks.js /docker-entrypoint-initdb.d/
ADD seeds/transactions.js /docker-entrypoint-initdb.d/
