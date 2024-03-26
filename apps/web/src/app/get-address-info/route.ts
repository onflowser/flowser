import { FlowGatewayService } from "@onflowser/core/src/flow-gateway.service";
import { FlowNamesService } from "@onflowser/core/src/flow-names.service";
import { FlowUtils } from "@onflowser/core/src/flow-utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const networkId = url.searchParams.get("networkId");
  const address = url.searchParams.get("address");

  if (!networkId) {
    return Response.json({
      message: "Missing `networkId` search param"
    }, {
      status: 400
    })
  }

  if (!FlowUtils.isValidFlowNetwork(networkId)) {
    return Response.json({
      message: "Unknown network ID"
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

  // No need to provide http service, as we don't use any related methods here.
  const flowGatewayService = new FlowGatewayService(undefined as never);

  // Configure before using flow names service.
  flowGatewayService.configureWithDefaults(networkId);

  const flowNamesService = new FlowNamesService({
    networkId
  });

  const profiles = await flowNamesService.getProfilesByAddress(address);

  return Response.json(profiles)
}
