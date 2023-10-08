import { IndexerService, InMemoryIndex } from "@onflowser/indexer";
import {
  FlowGatewayService,
  FlowAccountStorageService,
  FlowEmulatorService,
  ProcessManagerService,
  GoBindingsService,
  waitForMs,
} from "@onflowser/core";
import * as flowserResource from "@onflowser/api";

const flowGatewayService = new FlowGatewayService();

flowGatewayService.configure({
  restServerAddress: "http://localhost:8888",
  flowJSON: {
    contracts: {
      ExampleNFT: "cadence/contracts/exampleNFT/ExampleNFT.cdc",
      FungibleToken: {
        source: "",
        aliases: {
          emulator: "ee82856bf20e2aa6",
        },
      },
      MetadataViews: {
        source: "",
        aliases: {
          emulator: "f8d6e0586b0a20c7",
        },
      },
      NonFungibleToken: {
        source: "",
        aliases: {
          emulator: "f8d6e0586b0a20c7",
        },
      },
      ViewResolver: "cadence/contracts/standards/ViewResolver.cdc",
    },
    networks: {
      emulator: "127.0.0.1:3569",
      mainnet: "access.mainnet.nodes.onflow.org:9000",
      sandboxnet: "access.sandboxnet.nodes.onflow.org:9000",
      testnet: "access.devnet.nodes.onflow.org:9000",
    },
    accounts: {
      default: {
        address: "f669cb8d41ce0c74",
        key: "2e09fac1b3b8e128c67b2e57ba59ec8506ff8326053812135a954b4d3291096f",
      },
      "emulator-account": {
        address: "f8d6e0586b0a20c7",
        key: "d2c3686da84d61c13627bdf2127866fe358165734f5470be792e6771901d2856",
      },
      exampleNFT: {
        address: "192440c99cb17282",
        key: "58cfc56dcbbfa8bfb7b9898586793b0710dfebe8a0358774044968abc9acc8c2",
      },
      standards: {
        address: "fd43f9148d4b725d",
        key: "28946711cc802634ca4520c0f8b113e065c519dc02306a05ecb204a896ee80ed",
      },
      "0x01cf0e2f2f715450": {
        address: "0x01cf0e2f2f715450",
        key: "95b367208187ecc83a3e6c9aba61ad0edc00af3e0d678c60b39fe13ccfc5d75b",
      },
      "0x179b6b1cb6755e31": {
        address: "0x179b6b1cb6755e31",
        key: "f1f066337d4e853311807fd94bed599739d7cede8c6e6585414703eb0e0345ed",
      },
    },
    deployments: {
      emulator: {
        default: [],
        exampleNFT: ["ExampleNFT"],
        standards: ["ViewResolver"],
      },
    },
  },
});

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

(async function () {
  while (true) {
    await waitForMs(1000);
    const map = await Promise.all(
      Object.keys(indexes).map(async (key: any) => [
        key,
        (await (indexes as any)[key].findAll()).length,
      ])
    );
    // @ts-ignore
    const countLookup = new Map(map);
    console.log(countLookup);
  }
})();
