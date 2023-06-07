import { useEffect, useState } from "react";
// @ts-ignore
import * as fcl from "@onflow/fcl";
// @ts-ignore
import * as t from "@onflow/types";
import { toast } from "react-hot-toast";
import {
  useGetCurrentProject,
  useGetPollingAccounts,
  useGetProjectStatus,
} from "./use-api";
import { useQueryClient } from "react-query";
import { useAnalytics } from "./use-analytics";
import { AnalyticEvent } from "../services/analytics.service";
import { ServiceStatus } from "@flowser/shared";

export type FlowScriptArgumentValue = string | number;
export type FlowScriptArgumentType = string;

export type FlowScriptArgument = {
  value: FlowScriptArgumentValue;
  type: FlowScriptArgumentType;
};

function configureFcl(options: {
  devWalletUrl: string;
  accessNodePort: number;
}): void {
  fcl
    .config()
    // flowser app details
    .put("app.detail.icon", `http://localhost:6061/icon.png`)
    .put("app.detail.title", "Flowser")
    // Point App at Emulator
    .put("accessNode.api", `http://localhost:${options.accessNodePort}`)
    // Point FCL at dev-wallet (default port)
    .put("discovery.wallet", `${options.devWalletUrl}/fcl/authn`);
  // .put(
  //   "discovery.authn.endpoint",
  //   "https://fcl-discovery.onflow.org/api/testnet/authn"
  // );
}

export function useFlow() {
  const { track } = useAnalytics();
  const { data } = useGetCurrentProject();
  const { data: storedAccounts } = useGetPollingAccounts();
  const { data: projectStatus } = useGetProjectStatus();
  const { project } = data ?? {};
  const [loggedInUser, setLoggedInUser] = useState<{
    loggedIn: null;
    addr?: string;
  }>({
    loggedIn: null,
  });
  const [isLoggingIn, setLoggingIn] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  const accessNodePort = project?.emulator?.restServerPort ?? 8888;
  const devWalletPort = project?.devWallet?.port ?? 8701;
  const devWalletHost = "localhost";
  const devWalletUrl = `http://${devWalletHost}:${devWalletPort}`;

  useEffect(() => {
    if (project) {
      configureFcl({
        devWalletUrl,
        accessNodePort,
      });
    }
  }, [project]);

  console.log({ user: loggedInUser });

  useEffect(() => fcl.currentUser().subscribe(setLoggedInUser), []);

  async function customAuthorization(account: Record<string, unknown>) {
    console.log({ account });

    const targetAccountInfo = storedAccounts.find(
      (storedAccount) => storedAccount.address === loggedInUser.addr
    );

    if (!targetAccountInfo) {
      throw new Error(
        `Couldn't find target stored account: ${loggedInUser.addr}`
      );
    }

    const firstKey = targetAccountInfo.keys[0];

    return {
      ...account,
      tempId: `${targetAccountInfo.address}-${firstKey.index}`,
      addr: targetAccountInfo.address,
      keyId: firstKey.index,
      signingFunction: async (signable: unknown) => {
        console.log({ signable });
        return {
          addr: targetAccountInfo.address,
          keyId: firstKey.index,
          signature: "",
        };
      },
    };
  }

  async function sendTransaction(code: string, args: FlowScriptArgument[]) {
    track(AnalyticEvent.SEND_TRANSACTION);

    const transactionId = await fcl.mutate({
      cadence: code,
      args: (arg: any, t: any) => args.map((e) => arg(e.value, t[e.type])),
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [customAuthorization],
      limit: 50,
    });

    return {
      transactionId,
      status: await fcl.tx(transactionId).onceSealed(),
    };
  }

  async function logout() {
    track(AnalyticEvent.DISCONNECT_WALLET);

    setLoggingOut(true);
    try {
      await fcl.unauthenticate();
    } catch (e: unknown) {
      console.error("Fcl logout failed", e);
    } finally {
      // Resource keys currently don't include the project id
      // That's why we need to clear all (project scoped) cache
      // But in the future we'd want to include project id in all resource keys and urls
      queryClient.clear();
      setLoggingOut(false);
    }
  }

  async function login() {
    track(AnalyticEvent.CONNECT_WALLET);

    if (
      projectStatus?.devWalletApiStatus !== ServiceStatus.SERVICE_STATUS_ONLINE
    ) {
      return toast.error(
        `fcl-dev-wallet service doesn't appear to be running. 
        Make sure to start it with \`flow dev-wallet\` command.`
      );
    }

    setLoggingIn(true);
    try {
      const result = await fcl.authenticate();
      if (result.loggedIn) {
        toast("Logged in!");
      }
    } catch (e: any) {
      toast.error(`Login failed: ${e.message}`);
    } finally {
      setLoggingIn(false);
    }
  }

  return {
    login,
    logout,
    user: loggedInUser,
    isLoggingIn,
    isLoggingOut,
    isLoggedIn: loggedInUser.loggedIn,
    sendTransaction,
  };
}
