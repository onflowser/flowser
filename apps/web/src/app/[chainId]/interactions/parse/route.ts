import path from "path";
import {GoBindingsService} from "@onflowser/nodejs"

const goBindingsService = new GoBindingsService({
  binDirPath: path.join(
    __dirname,
    '../../..',
    'bin',
  ),
});

export async function POST(request: Request) {
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
