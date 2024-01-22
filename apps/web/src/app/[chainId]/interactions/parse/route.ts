import {GoBindingsService} from "@onflowser/nodejs"
import path from "path";
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
    : path.resolve(process.cwd(), ".next/bin"),
});

export async function POST(request: Request) {
  // https://github.com/vercel/next.js/issues/8251#issuecomment-657770901
  try {
    console.log(path.resolve("./public"));
  } catch (e) {
    console.error(e)
  }
  try {
    console.log(fs.readdirSync(process.cwd(), {recursive: true}))
  } catch (error) {
    console.error(error)
  }
  try {
    console.log(fs.readdirSync(path.resolve("./public")))
  }catch (error) {
    console.error(error)
  }

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
