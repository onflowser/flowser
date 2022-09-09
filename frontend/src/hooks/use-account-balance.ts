import { useGetAccount } from "./use-api";

export type GetAccountBalanceState = {
  flow: string;
};

export function useGetAccountBalance(address: string): GetAccountBalanceState {
  const { data } = useGetAccount(address);
  const flowBalance = data?.account?.balance;
  return {
    flow: flowBalance ? `${flowBalance} FLOW` : "-",
  };
}
