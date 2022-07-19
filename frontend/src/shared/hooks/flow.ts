import { useEffect, useState } from "react";
import "../config/flow-fcl";
// @ts-ignore
import * as fcl from "@onflow/fcl";
// @ts-ignore
import * as t from "@onflow/types";
import { toast } from "react-hot-toast";
import splitbee from "@splitbee/web";

export type FlowScriptArgumentValue = string | number;
export type FlowScriptArgumentType = string;

export type FlowScriptArgument = {
  value: FlowScriptArgumentValue;
  type: FlowScriptArgumentType;
};

export function useFlow() {
  const [user, setUser] = useState({ loggedIn: null });
  const [isLoggingIn, setLoggingIn] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);

  useEffect(() => fcl.currentUser().subscribe(setUser), []);

  async function sendTransaction(code: string, args: FlowScriptArgument[]) {
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
    setLoggingOut(true);
    try {
      await fcl.unauthenticate();
      toast("Logged out!");
      splitbee.track("DevWallet: logout");
    } catch (e: any) {
      console.log(e);
      toast.error(`Logout failed: ${e.message}`);
    } finally {
      setLoggingOut(false);
    }
  }

  async function login() {
    setLoggingIn(true);
    try {
      const result = await fcl.authenticate();
      if (result.loggedIn) {
        toast("Logged in!");
        splitbee.track("DevWallet: login");
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
