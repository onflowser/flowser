"use client";
import { InteractionsPage } from "@onflowser/ui/src/interactions/InteractionsPage";
import {
  InteractionRegistryProvider,
  useInteractionRegistry
} from "@onflowser/ui/src/interactions/contexts/interaction-registry.context";
import {
  TemplatesRegistryProvider, useTemplatesRegistry
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
  FlowNetworkProvider,
} from "@onflowser/ui/src/contexts/flow-network.context";
import { ScriptOutcome, TransactionOutcome } from "@onflowser/ui/src/interactions/core/core-types";
import * as fcl from "@onflow/fcl"
import useSWR, { SWRConfig } from 'swr';
import { HttpService } from "@onflowser/core/src/http.service";
import FullScreenLoading from "@onflowser/ui/src/common/loaders/FullScreenLoading/FullScreenLoading";
import { useInteractionsPageParams } from "./use-interaction-page-params";
import { FlowChainID, FlowNetworkId } from "@onflowser/core/src/flow-utils";
import defaultFlowJson from "./default-flow.json";
import { FlowNamesService } from "@onflowser/core/src/flow-names.service";
import { BaseDialog } from "@onflowser/ui/src/common/overlays/dialogs/base/BaseDialog";

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
    return fetch(`${window.location.origin}/parse-interaction`, {
      method: "POST",
      body: JSON.stringify({ sourceCode }),
    }).then(res => res.json())
  }

  async sendTransaction(request: SendTransactionRequest): Promise<TransactionOutcome> {
    const authz = fcl.authz as unknown as FlowAuthorizationFunction;
    const parsedInteraction = await this.parse(request.cadence);
    const authorizersCount = parsedInteraction.interaction?.transaction?.authorizerCount ?? 0;
    return await this.flowGatewayService.sendTransaction({
      cadence: request.cadence,
      arguments: request.arguments,
      // TODO(web): Refactor send transaction API
      authorizations: Array.from({ length: authorizersCount }).map(() => authz),
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
          .map(([key, value]: [any, any]) => [key, {
            ...value,
            createdAt: new Date(value.createdAt),
            updatedAt: new Date(value.updatedAt),
          }])
      )
    }
  }
}

class FlowserAppService {
  readonly blockchainIndexes: BlockchainIndexes;
  readonly logger: IFlowserLogger;
  readonly flowAccountStorageService: FlowAccountStorageService;
  readonly flowGatewayService: FlowGatewayService;
  readonly flowNamesService: FlowNamesService;
  readonly interactionsService: InteractionsService;
  readonly httpService: HttpService;
  private readonly indexer: FlowIndexerService;

  constructor(public readonly networkId: FlowNetworkId) {

    function buildStorageKey(resourceName: string) {
      return `${networkId}/${resourceName}`
    }

    // Emulator network is reset every time emulator is stopped (if --persist flag is omitted).
    // For simplify sake don't persist the cache between page refreshes.
    if (networkId === "emulator") {
      this.blockchainIndexes = {
        accountKey: new InMemoryIndex(),
        transaction: new InMemoryIndex(),
        block: new InMemoryIndex(),
        account: new InMemoryIndex(),
        event: new InMemoryIndex(),
        contract: new InMemoryIndex(),
        accountStorage: new InMemoryIndex(),
      }
    } else {
      this.blockchainIndexes = {
        accountKey: new LocalStorageIndex(buildStorageKey("accountKeys")),
        transaction: new LocalStorageIndex(buildStorageKey("transactions")),
        block: new LocalStorageIndex(buildStorageKey("blocks")),
        account: new LocalStorageIndex(buildStorageKey("accounts")),
        event: new LocalStorageIndex(buildStorageKey("events")),
        contract: new LocalStorageIndex(buildStorageKey("contracts")),
        accountStorage: new LocalStorageIndex(buildStorageKey("accountStorages")),
      }
    }

    this.logger = new WebLogger();
    this.httpService = new HttpService(this.logger);
    this.flowGatewayService = new FlowGatewayService(
      this.httpService
    );

    this.flowNamesService = new FlowNamesService({
      networkId
    });

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

    this.configureNetwork(networkId);
  }

  private configureNetwork(networkId: FlowNetworkId) {
    this.flowGatewayService.configureWithDefaults(networkId);
    if (networkId === "emulator") {
      // TODO(web): Provide a way for users to overwrite the default flow.json config?
      // Provide config to support new import syntax in interactions.
      // Default flow.json configuration taken from the standard scaffold.
      // https://github.com/sideninja/flow-basic-scaffold/blob/main/flow.json
      this.flowGatewayService.configureFlowJSON(defaultFlowJson)
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
        const block = await this.flowGatewayService.getBlockById(id)
        await this.indexer.processBlock(block, {
          indexTransactions: false
        });
        return this.blockchainIndexes.block.findOneById(id);
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


export default function Root() {
  const { networkId } = useInteractionsPageParams();

  const appService = new FlowserAppService(networkId);

  return (
    <OptionalEmulatorSetupPrompt appService={appService}>
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
                accountKeyIndex: appService.getAccountKeysIndex(),
                flowNamesService: appService.flowNamesService
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
    </OptionalEmulatorSetupPrompt>
  );
}

function OptionalEmulatorSetupPrompt(props: {
  children: ReactNode;
  appService: FlowserAppService;
}) {
  const {flowGatewayService, networkId} = props.appService;

  const {data} = useSWR("api-status", () =>
    Promise.all([
     flowGatewayService.isRestApiReachable(),
     flowGatewayService.isDiscoveryWalletReachable(),
    ]).then(([isRestApiReachable, isDiscoveryWalletReachable]) => ({
      isRestApiReachable,
      isDiscoveryWalletReachable
    }))
  );

  if (networkId !== "emulator") {
    return props.children;
  }

  if (!data) {
    return <FullScreenLoading />
  }

  const areEmulatorApisReachable = data.isRestApiReachable && data.isDiscoveryWalletReachable;

  if (areEmulatorApisReachable) {
    return props.children;
  }

  return (
    <>
      {props.children}
      {!areEmulatorApisReachable && (
        <BaseDialog>
          <div className="flex flex-col justify-center h-full gap-y-4">
             <div className="flex flex-col gap-y-2">
               <h2 className="font-bold text-2xl">Before you start 👀</h2>
               <p>You need to run the following Flow development services manually.</p>
             </div>
            <ApiSetupPrompt
              isReachable={data.isRestApiReachable}
              label="Emulator"
              setupCommand="flow emulator"
              expectedPort={FlowGatewayService.defaultPorts.emulatorRestApiPort}
            />
            <ApiSetupPrompt
              isReachable={data.isDiscoveryWalletReachable}
              label="Dev wallet"
              setupCommand="flow dev-wallet"
              expectedPort={FlowGatewayService.defaultPorts.discoveryWalletPort}
            />
          </div>
        </BaseDialog>
      )}
    </>
  )
}

function ApiSetupPrompt(props: {
  isReachable: boolean;
  label: string;
  setupCommand: string;
  expectedPort: number;
}) {
  return (
    <div className="flex flex-col">
      <code>{props.isReachable ? '✅' : '❌'} {props.setupCommand}</code>
      <span className="text-gray-400">{props.label} must be running on port {props.expectedPort}.</span>
    </div>
  )
}

function Content() {
  const { networkId, interaction } = useInteractionsPageParams();
  const interactionRegistry = useInteractionRegistry();
  const templatesRegistry = useTemplatesRegistry();

  useEffect(() => {
    const template = templatesRegistry.templates.find(e => e.id === interaction);
    if (!interactionRegistry.focusedDefinition && template && template.source === "flix") {
      const interactionId = crypto.randomUUID();
      interactionRegistry.create({
        ...template,
        id: interactionId,
        forkedFromTemplateId: template.id
      });
      interactionRegistry.setFocused(interactionId);
    }
  }, [networkId, templatesRegistry.templates]);

  useEffect(() => {
    const focusedInteraction = interactionRegistry.focusedDefinition;
    // Native browser state API is supported by Next.js.
    // See: https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#using-the-native-history-api
    if (focusedInteraction?.forkedFromTemplateId) {
      window.history.replaceState(
        null,
        '',
        `/${networkId}/${focusedInteraction.forkedFromTemplateId}`
      )
    } else {
      window.history.replaceState(null, '', `/${networkId}`);
    }
  }, [interactionRegistry.focusedDefinition]);

  useEffect(() => {
    // Sign out the user when switching networks
    // or "address is invalid for chain" error will be thrown.
    fcl.unauthenticate()
  }, [networkId]);

  return (
    <InteractionsPage
      tabOrder={["templates", "history"]}
      enabledInteractionSourceTypes={[
        'session',
        'flix',
      ]}
    />
  );
}

class FlowService implements IFlowService {
    async getIndexOfAddress(chainID: FlowChainID, address: string): Promise<number> {
      const response = await fetch(`${window.location.origin}/get-address-index?chainId=${chainID}&address=${address}`);
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
