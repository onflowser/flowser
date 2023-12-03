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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sourceCode = searchParams.get('sourceCode');

  if (sourceCode === null) {
    throw new Error("Missing `sourceCode` query param")
  }

  const parsedInteraction = await goBindingsService.getParsedInteraction({
    sourceCode
  })

  return Response.json(parsedInteraction)
}
