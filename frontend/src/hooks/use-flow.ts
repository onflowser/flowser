import { useEffect, useState } from "react";
// @ts-ignore
import * as fcl from "@onflow/fcl";
// @ts-ignore
import * as t from "@onflow/types";
import { toast } from "react-hot-toast";
import { useGetCurrentProject } from "./use-api";
import { useQueryClient } from "react-query";
import { useAnalytics } from "./use-analytics";
import { AnalyticEvent } from "../services/analytics.service";

export type FlowScriptArgumentValue = string | number;
export type FlowScriptArgumentType = string;

export type FlowScriptArgument = {
  value: FlowScriptArgumentValue;
  type: FlowScriptArgumentType;
};

export function setFclConfig(options: {
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
}

export function useFlow() {
  const { track } = useAnalytics();
  const { data } = useGetCurrentProject();
  const { project } = data ?? {};
  const [user, setUser] = useState<{ loggedIn: null; addr?: string }>({
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
      setFclConfig({
        devWalletUrl,
        accessNodePort,
      });
    }
  }, [project]);

  useEffect(() => fcl.currentUser().subscribe(setUser), []);

  async function sendTransaction(code: string, args: FlowScriptArgument[]) {
    track(AnalyticEvent.SEND_TRANSACTION);

    const transactionId = await fcl.mutate({
      cadence: code,
      args: (arg: any, t: any) => args.map((e) => arg(e.value, t[e.type])),
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
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

    if (!project?.devWallet?.run) {
      // TODO(milestone-x): Check if wallet is online with GET {devWalletUrl}/api request
      toast(
        "Make sure you started the dev wallet with `flow dev-wallet` command"
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
    user,
    isLoggingIn,
    isLoggingOut,
    isLoggedIn: user.loggedIn,
    sendTransaction,
  };
}
