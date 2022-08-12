// @ts-ignore
import * as fcl from "@onflow/fcl";

fcl
  .config()
  // flowser app details
  .put("app.detail.icon", `${process.env.REACT_APP_URL}/favicon.ico`)
  .put("app.detail.title", "Flowser")
  // Point App at Emulator
  // TODO(milestone-3): Use the value stored in Project entity (under project.gateway)
  .put("accessNode.api", "http://localhost:8080")
  // Point FCL at dev-wallet (default port)
  // TODO(milestone-3): Enable users to change the default dev-wallet port setting?
  .put("discovery.wallet", "http://localhost:8701/fcl/authn");
