# Flowser backend

## Dependencies

If you want to use the sqlite database (e.g. along with `better-sqlite3` datasource), you will need to follow the steps described in https://github.com/WiseLibs/better-sqlite3#installation.

## Configuration

| Name                       | Required | Default   |
|----------------------------|----------|-----------|
| `DATABASE_TYPE`            |          | mysql     |
| `DATABASE_HOST`            |          | localhost |
| `DATABASE_PORT`            |          | 3306      |
| `DATABASE_USERNAME`        | ✅        |           |
| `DATABASE_PASSWORD`        | ✅        |           |
| `DATABASE_NAME`            | ✅        |           |
| `DATA_FETCH_INTERVAL`      |          | 3000 (ms) |
| `FLOW_STORAGE_SERVER_PORT` |          | 8899      |
| `GENERATE_API_DOCS_FILE`   |          | false     |
