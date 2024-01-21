import path from "path";
import {GoBindingsService} from "@onflowser/nodejs"

const goBindingsService = new GoBindingsService({
  binDirPath: path.join(
    __dirname,
    '../../../../../../../..',
    'packages',
    'nodejs',
    'bin',
  ),
});

export async function POST(request: Request) {
  const requestBody = await request.json();
  const sourceCode = requestBody?.sourceCode;

  if (!sourceCode) {
    throw new Error("Missing `sourceCode` field in body")
  }

  const parsedInteraction = await goBindingsService.getParsedInteraction({
    sourceCode
  })

  return Response.json(parsedInteraction)
}
