import {GoBindingsService} from "@onflowser/nodejs"
import path from "path";
import getConfig from 'next/config'
import fs from "fs";

const isDev = process.env.NODE_ENV === "development";

const goBindingsService = new GoBindingsService({
  // In dev we can pull the bin directly from the `nodejs/bin` dir in the monorepo.
  // While in prod we must use the one that's copied to the current folder with `setup-bin` script.
  binDirPath: isDev
    ? path.join(
        __dirname,
        '../../../../../../../..',
        'packages',
        'nodejs',
        'bin',
      )
    : path.join(process.cwd(), ".next/bin"),
});

export async function POST(request: Request) {
  const { serverRuntimeConfig } = getConfig();
  console.log(fs.readdirSync(path.join(serverRuntimeConfig.PROJECT_ROOT)))
  console.log(fs.readdirSync(path.join(serverRuntimeConfig.PROJECT_ROOT), {recursive: true}))

  const requestBody = await request.json();
  const sourceCode = requestBody?.sourceCode;

  if (!sourceCode) {
    return Response.json({
      message: "Missing `sourceCode` field in body"
    }, {
      status: 400
    })
  }

  try {
    const parsedInteraction = await goBindingsService.getParsedInteraction({
      sourceCode
    });

    return Response.json(parsedInteraction)
  } catch (error: any) {
    return Response.json({
      message: `Error parsing: ${error.message}`
    }, {
      status: 500
    })
  }
}
