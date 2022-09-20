import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
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

export let start: (options: StartWorkerOptions) => Promise<unknown>;

if (isMainThread) {
  start = async function ({ userDataPath }: StartWorkerOptions) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          userDataPath,
        },
      });
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };
} else {
  const { userDataPath } = workerData;
  startBackend({
    userDataPath,
  }).then(() => parentPort?.postMessage("Backend started"));
}
