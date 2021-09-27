#!/bin/bash

#
# Inits Flowser database, inserts flowser database user
#
mongo -- "$MONGO_INITDB_DATABASE" <<EOF
  var rootUser = '$MONGO_INITDB_ROOT_USERNAME';
  var rootPassword = '$MONGO_INITDB_ROOT_PASSWORD';
  var flowserDatabase = '$MONGO_INITDB_DATABASE'
  db.auth(rootUser, rootPassword);

  db = db.getSiblingDB(flowserDatabase);

  db.createUser({ user: rootUser,
    pwd: rootPassword,
    roles:[ { role: "readWrite",
        db: flowserDatabase
    } ],
    mechanisms:[ "SCRAM-SHA-1"]
  });
EOF
