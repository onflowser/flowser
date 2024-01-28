import path from "path";
import {GoBindingsService} from "@onflowser/nodejs"

const isDev = process.env.NODE_ENV === "development";

const goBindingsService = new GoBindingsService({
  // In dev we can pull the bin directly from the `nodejs/bin` dir in the monorepo.
  // While in prod we must use the one that's copied to the current folder with `setup-bin` script.
  binDirPath: isDev
    ? path.join(
      __dirname,
      '../../../../../..',
      'packages',
      'nodejs',
      'bin',
    )
    // https://github.com/vercel/next.js/issues/8251#issuecomment-657770901
    : path.resolve("./public/bin"),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const chainId = url.searchParams.get("chainId");
  const address = url.searchParams.get("address");

  if (!chainId) {
    return Response.json({
      message: "Missing `chainId` search param"
    }, {
      status: 400
    })
  }

  if (!address) {
    return Response.json({
      message: "Missing `address` search param"
    }, {
      status: 400
    })
  }

  const index = await goBindingsService.getIndexOfAddress({
    hexAddress: address,
    chainId
  })

  return Response.json({ index })
}
