import { IndexerService, InMemoryIndex } from "@onflowser/indexer";
import {
  FlowGatewayService,
  FlowAccountStorageService,
  FlowEmulatorService,
  ProcessManagerService,
  GoBindingsService,
} from "@onflowser/core";
import * as flowserResource from "@onflowser/api";

const flowGatewayService = new FlowGatewayService();
const flowAccountStorageService = new FlowAccountStorageService(
  flowGatewayService
);
const processManagerService = new ProcessManagerService();
const flowEmulatorService = new FlowEmulatorService(processManagerService);
const goBindingsService = new GoBindingsService();

const indexes = {
  transaction: new InMemoryIndex<flowserResource.FlowTransaction>(),
  block: new InMemoryIndex<flowserResource.FlowBlock>(),
  account: new InMemoryIndex<flowserResource.FlowAccount>(),
  event: new InMemoryIndex<flowserResource.FlowEvent>(),
  contract: new InMemoryIndex<flowserResource.FlowContract>(),
  accountStorage: new InMemoryIndex<flowserResource.FlowAccountStorage>(),
};

const indexer = new IndexerService(
  indexes.transaction,
  indexes.account,
  indexes.block,
  indexes.event,
  indexes.contract,
  indexes.accountStorage,
  flowAccountStorageService,
  flowGatewayService,
  flowEmulatorService,
  goBindingsService
);

indexer.start();
