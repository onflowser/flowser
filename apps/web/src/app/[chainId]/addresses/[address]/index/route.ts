import path from "path";
import {GoBindingsService} from "@onflowser/nodejs"

const goBindingsService = new GoBindingsService({
  binDirPath: path.join(
    __dirname,
    '../../../../../../../../..',
    'packages',
    'nodejs',
    'bin',
  ),
});

type UrlParams = { chainId: string; address: string }

export async function GET(request: Request, { params }: { params: UrlParams }) {

  const index = await goBindingsService.getIndexOfAddress({
    hexAddress: params.address,
    chainId: params.chainId
  })

  return Response.json({ index })
}
