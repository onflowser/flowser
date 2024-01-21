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
    return new Response("Missing `sourceCode` field in body", {
      status: 400
    })
  }

  const parsedInteraction = await goBindingsService.getParsedInteraction({
    sourceCode
  })

  return Response.json(parsedInteraction)
}
