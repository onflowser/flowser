import path from "path";
import { createApp } from "@flowser/backend";
import { INestApplication } from "@nestjs/common";

export let backend: INestApplication;

async function startBackend({ userDataPath }: { userDataPath: string }) {
  const databaseFilePath = path.join(userDataPath, "flowser.sqlite");
  if (backend) {
    await backend.close();
  }
  backend = await createApp({
    database: {
      type: "sqlite",
      name: databaseFilePath,
    },
    common: {
      httpServerPort: 6061,
    },
  });
}

export type StartWorkerOptions = {
  userDataPath: string;
};

// TODO(milestone-x): We should spawn the backend in a separate thread or process
// This was already attempted in https://github.com/onflowser/flowser/pull/120,
// but it lead to critical threading-related issues with node-sqlite3
export const start = async (options: StartWorkerOptions): Promise<void> => {
  await startBackend(options);
};
