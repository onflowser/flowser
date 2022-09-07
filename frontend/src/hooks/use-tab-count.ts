import {
  useGetPollingAccounts,
  useGetPollingBlocks,
  useGetPollingContracts,
  useGetPollingEvents,
  useGetPollingTransactions,
  useGetProjectObjects,
} from "./use-api";

export type UseTabCountState = {
  transactions: number | undefined;
  blocks: number | undefined;
  accounts: number | undefined;
  contracts: number | undefined;
  events: number | undefined;
  project: number | undefined;
};

export function useTabCount(): UseTabCountState {
  const { data: transactions } = useGetPollingTransactions();
  const { data: blocks } = useGetPollingBlocks();
  const { data: accounts } = useGetPollingAccounts();
  const { data: contracts } = useGetPollingContracts();
  const { data: events } = useGetPollingEvents();
  const { data: projectObjects } = useGetProjectObjects();

  return {
    transactions: transactions?.length,
    blocks: blocks?.length,
    accounts: accounts?.length,
    contracts: contracts?.length,
    events: events?.length,
    project: projectObjects?.contracts.length,
  };
}
