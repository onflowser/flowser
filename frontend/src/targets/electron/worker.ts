import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import path from "path";
import { app } from "electron";
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

export let start: () => Promise<unknown>;

if (isMainThread) {
  start = async function () {
    const userDataPath = app.getPath("userData");
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
