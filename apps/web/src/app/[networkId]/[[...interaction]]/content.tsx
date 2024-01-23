"use client";
import { InteractionsPage } from "@onflowser/ui/src/interactions/InteractionsPage";
import {
  InteractionRegistryProvider,
  useInteractionRegistry
} from "@onflowser/ui/src/interactions/contexts/interaction-registry.context";
import {
  TemplatesRegistryProvider
} from "@onflowser/ui/src/interactions/contexts/templates.context";
import { NavigationProvider } from "@onflowser/ui/src/contexts/navigation.context";
import { ReactNode, useEffect } from "react";
import { useParams, useSelectedLayoutSegments, usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ExecuteScriptRequest, IFlowService,
  IInteractionService, SendTransactionRequest,
  ServiceRegistryProvider
} from "@onflowser/ui/src/contexts/service-registry.context";
import {
  FlowAccount,
  FlowAccountKey,
  FlowAccountStorage,
  FlowBlock,
  FlowContract,
  FlowEvent,
  FlowTransaction,
  IndexableResource,
  IResourceIndexReader, OmitTimestamps,
  ParsedInteractionOrError, RequireOnly, WorkspaceTemplate
} from "@onflowser/api";
import {
  BlockchainIndexes,
  FlowAccountStorageService, FlowAuthorizationFunction, FlowGatewayService,
  FlowIndexerService,
  IFlowserLogger,
  InMemoryIndex
} from "@onflowser/core";
import {
  ChainID,
  FlowNetworkId,
  FlowNetworkProvider,
  isValidFlowNetwork
} from "@onflowser/ui/src/contexts/flow-network.context";
import { ScriptOutcome, TransactionOutcome } from "@onflowser/ui/src/interactions/core/core-types";
import * as fcl from "@onflow/fcl"
import { SWRConfig } from 'swr';
import { HttpService } from "@onflowser/core/src/http.service";
import { useGetFlixTemplate } from "@onflowser/ui/src/hooks/use-flix";
import { FlixUtils } from "@onflowser/ui/src/utils/flix-utils";
import { useInteractionsPageParams } from "@/app/[networkId]/[[...interaction]]/use-params";

const indexSyncIntervalInMs = 500;

class InteractionsService implements IInteractionService {

  constructor(private readonly flowGatewayService: FlowGatewayService) {}

  async executeScript(request: ExecuteScriptRequest): Promise<ScriptOutcome> {
    const result = await this.flowGatewayService.executeScript({
      cadence: request.cadence,
      arguments: request.arguments
    });

    return {
      result
    }
  }

  getTemplates(): Promise<WorkspaceTemplate[]> {
    return Promise.resolve([]);
  }

  async parse(sourceCode: string): Promise<ParsedInteractionOrError> {
    // It doesn't matter which chain ID we use in URL.
    return fetch(`${window.location.origin}/flow-emulator/interactions/parse`, {
      method: "POST",
      body: JSON.stringify({ sourceCode }),
    }).then(res => res.json())
  }

  async sendTransaction(request: SendTransactionRequest): Promise<TransactionOutcome> {
    const authz = fcl.authz as unknown as FlowAuthorizationFunction;
    return await this.flowGatewayService.sendTransaction({
      cadence: request.cadence,
      arguments: request.arguments,
      // TODO(web): Authorizers must match the number of AuthAccount's passed to prepare statement
      authorizations: [],
      payer: authz,
      proposer: authz
    })
  }

}

class WebLogger implements IFlowserLogger {
  debug(message: any): void {
    console.debug(message);
  }

  error(message: any, error?: unknown): void {
    console.error(message, error);
  }

  log(message: any): void {
    console.log(message);
  }

  verbose(message: any): void {
    console.debug(message);
  }

  warn(message: any): void {
    console.warn(message);
  }

}

class LocalStorageIndex<Resource extends IndexableResource> extends InMemoryIndex<Resource> {
  constructor(private readonly storageKey: string) {
    super();
    this.syncFromLocalStorage();
  }

  async create(resource: OmitTimestamps<Resource>): Promise<void> {
    await super.create(resource);
    this.syncToLocalStorage()
  }

  async update(resource: OmitTimestamps<RequireOnly<Resource, "id">>): Promise<void> {
    await super.update(resource);
    this.syncToLocalStorage()
  }

  async delete(resource: OmitTimestamps<RequireOnly<Resource, "id">>): Promise<void> {
    await super.delete(resource);
    this.syncToLocalStorage()
  }

  async clear(): Promise<void> {
    await super.clear();
    this.syncToLocalStorage();
  }

  private syncToLocalStorage() {
    window.localStorage.setItem(
      this.storageKey,
      JSON.stringify(Object.fromEntries(this.lookup.entries()))
    );
  }

  private syncFromLocalStorage() {
    const serializedLookup = window.localStorage.getItem(this.storageKey);
    if (serializedLookup !== null) {
      this.lookup = new Map(
        Object.entries(JSON.parse(serializedLookup))
      )
    }
  }
}

class FlowserAppService {
  readonly blockchainIndexes: BlockchainIndexes;
  readonly logger: IFlowserLogger;
  readonly flowAccountStorageService: FlowAccountStorageService;
  readonly flowGatewayService: FlowGatewayService;
  readonly interactionsService: InteractionsService;
  readonly httpService: HttpService;
  private readonly indexer: FlowIndexerService;

  constructor(networkId: FlowNetworkId) {

    function buildStorageKey(resourceName: string) {
      return `${networkId}/${resourceName}`
    }

    this.blockchainIndexes = {
      accountKey: new LocalStorageIndex(buildStorageKey("accountKeys")),
      transaction: new LocalStorageIndex(buildStorageKey("transactions")),
      block: new LocalStorageIndex(buildStorageKey("blocks")),
      account: new LocalStorageIndex(buildStorageKey("accounts")),
      event: new LocalStorageIndex(buildStorageKey("events")),
      contract: new LocalStorageIndex(buildStorageKey("contracts")),
      accountStorage: new LocalStorageIndex(buildStorageKey("accountStorages")),
    }

    this.logger = new WebLogger();
    this.httpService = new HttpService(this.logger);
    this.flowGatewayService = new FlowGatewayService(
      this.httpService
    )
    this.interactionsService = new InteractionsService(
      this.flowGatewayService
    )
    this.flowAccountStorageService = new FlowAccountStorageService(this.flowGatewayService);

    this.indexer = new FlowIndexerService(
      this.logger,
      this.flowAccountStorageService,
      this.flowGatewayService,
      this.interactionsService,
      this.blockchainIndexes
    )

    this.configureGateway(networkId);
  }

  private configureGateway(networkId: FlowNetworkId) {
    switch (networkId) {
      case "emulator":
        return this.flowGatewayService.configure({
          network: "local",
          accessNodeRestApiUrl: "http://localhost:8888",
          discoveryWalletUrl: "http://localhost:8701/fcl/authn"
        });
      case "testnet":
        return this.flowGatewayService.configure({
          network: "testnet",
          accessNodeRestApiUrl: "https://rest-testnet.onflow.org",
          discoveryWalletUrl: "https://fcl-discovery.onflow.org/testnet/authn"
        });
      case "mainnet":
        return this.flowGatewayService.configure({
          network: "mainnet",
          accessNodeRestApiUrl: "https://rest-mainnet.onflow.org",
          discoveryWalletUrl: "https://fcl-discovery.onflow.org/authn"
        });
    }
  }

  getTransactionIndex(): IResourceIndexReader<FlowTransaction> {
    return {
      findAll: () => this.blockchainIndexes.transaction.findAll(),
      findOneById: async id => {
        const existing = await this.blockchainIndexes.transaction.findOneById(id);
        if (existing) {
          return existing;
        }
        const [transaction, transactionStatus] = await Promise.all([
          this.flowGatewayService.getTransactionById(id),
          this.flowGatewayService.getTransactionStatusById(id),
        ]);
        await this.indexer.processTransaction({
          transaction,
          transactionStatus
        });
        return this.blockchainIndexes.transaction.findOneById(id);
      },
    }
  }

  getBlockIndex(): IResourceIndexReader<FlowBlock> {
    return {
      findAll: () => this.blockchainIndexes.block.findAll(),
      findOneById: async id => {
        console.log("block id", id);
        return undefined;
      }
    }
  }

  getAccountsIndex(): IResourceIndexReader<FlowAccount> {
    return {
      findAll: () => this.blockchainIndexes.account.findAll(),
      findOneById: async id => {
        console.log("account id", id);
        return undefined;
      }
    }
  }

  getEventsIndex(): IResourceIndexReader<FlowEvent> {
    return {
      findAll: () => this.blockchainIndexes.event.findAll(),
      findOneById: async id => {
        console.log("event id", id);
        return undefined;
      }
    }
  }

  getContractsIndex(): IResourceIndexReader<FlowContract> {
    return {
      findAll: () => this.blockchainIndexes.contract.findAll(),
      findOneById: async id => {
        console.log("contract id", id);
        return undefined;
      }
    }
  }

  getAccountStorageIndex(): IResourceIndexReader<FlowAccountStorage> {
    return {
      findAll: () => this.blockchainIndexes.accountStorage.findAll(),
      findOneById: async id => {
        console.log("storage id", id);
        return undefined;
      }
    }
  }

  getAccountKeysIndex(): IResourceIndexReader<FlowAccountKey> {
    return {
      findAll: () => this.blockchainIndexes.accountKey.findAll(),
      findOneById: async id => {
        console.log("account key id", id);
        return undefined;
      }
    }
  }
}


export default function ClientContent() {
  const { networkId } = useInteractionsPageParams();

  // TODO: Why is window undefined if we use "use client"?
  if (typeof window === "undefined") {
    return null;
  }

  const appService = new FlowserAppService(networkId);

  return (
    <SWRConfig
      value={{
        refreshInterval: indexSyncIntervalInMs,
        // Most of the time (e.g. when polling transaction in outcome display)
        // we want this polling to happen with the same frequency as above.
        errorRetryInterval: indexSyncIntervalInMs,
      }}
    >
    <FlowNetworkProvider config={{ networkId }}>
      <NextJsNavigationProvider>
        <ServiceRegistryProvider
          services={{
            flowService: new FlowService(),
            interactionsService: appService.interactionsService,
            transactionsIndex: appService.getTransactionIndex(),
            blocksIndex: appService.getBlockIndex(),
            accountIndex: appService.getAccountsIndex(),
            eventsIndex: appService.getEventsIndex(),
            contractIndex: appService.getContractsIndex(),
            accountStorageIndex: appService.getAccountStorageIndex(),
            accountKeyIndex: appService.getAccountKeysIndex()
          }}
        >
          <InteractionRegistryProvider>
            <TemplatesRegistryProvider>
              <Content />
            </TemplatesRegistryProvider>
          </InteractionRegistryProvider>
        </ServiceRegistryProvider>
      </NextJsNavigationProvider>
    </FlowNetworkProvider>
    </SWRConfig>
  );
}

function Content() {
  const { networkId, interaction } = useInteractionsPageParams();
  const interactionRegistry = useInteractionRegistry();
  const { data: flix } = useGetFlixTemplate(interaction ?? "");

  useEffect(() => {
    if (flix) {
      const interaction = FlixUtils.flixTemplateToInteraction(flix, networkId);
      interactionRegistry.create(interaction);
      interactionRegistry.setFocused(interaction.id);
    }
  }, [flix, networkId]);

  return <InteractionsPage />;
}

class FlowService implements IFlowService {
    async getIndexOfAddress(chainID: ChainID, address: string): Promise<number> {
      const response = await fetch(`${window.location.origin}/${chainID}/addresses/${address}/index`);
      const data = await response.json();
      return data.index as number;
    }
}

function NextJsNavigationProvider(props: { children: ReactNode }) {
  const params = useParams();
  const matches = useSelectedLayoutSegments();
  const pathname = usePathname();
  const {} = useRouter();
  const search = useSearchParams();

  function navigate() {
    // TODO(web-mvp): Implement
  }


  console.log({ matches, pathname });
  return (
    <NavigationProvider controller={{
      params,
      // TODO(web-mvp): Implement matches
      matches: [],
      navigate,
      location: {
        search,
        pathname,
        // TODO(web-mvp): Implement hash
        hash: ""
      }
    }}>
      {props.children}
    </NavigationProvider>
  );
}
