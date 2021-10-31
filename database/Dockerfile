FROM mongo:5.0

# Init and seed database
ADD init-db.sh /docker-entrypoint-initdb.d/
ADD seeds/projects.js /docker-entrypoint-initdb.d/
