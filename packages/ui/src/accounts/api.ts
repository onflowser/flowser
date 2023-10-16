import useSWR, { SWRResponse } from "swr";
import { FlowAccount } from "@onflowser/api";
import { useServiceRegistry } from "../contexts/service-registry.context";

export function useGetAccounts(): SWRResponse<FlowAccount[]> {
  const { accountIndex } = useServiceRegistry();
  return useSWR("accounts", () => accountIndex.findAll(), {
    refreshInterval: 1000,
  });
}

export function useGetAddressIndex(options: {
  address: string;
  chainId: "flow-emulator";
}): SWRResponse<number> {
  // TODO(restructure): Implement
  return useSWR("account-index", () => 0)
}
