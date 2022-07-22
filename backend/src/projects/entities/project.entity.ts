import { AfterLoad, Column, Entity, Index, PrimaryColumn } from "typeorm";
import { GatewayConfigurationEntity } from "./gateway-configuration.entity";
import { serializeEmbeddedTypeORMEntity, toKebabCase } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { EmulatorConfigurationEntity } from "./emulator-configuration.entity";
import { PollingEntity } from "../../common/entities/polling.entity";
import config from "../../config";

export enum FlowNetworks {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  EMULATOR = "emulator",
}

@Entity({ name: "projects" })
export class Project extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column()
  pingable: boolean = false;

  @Column("simple-json", { nullable: true })
  gateway: GatewayConfigurationEntity;

  @Column("simple-json", { nullable: true })
  emulator: EmulatorConfigurationEntity;

  @Column("boolean", { default: false })
  isCustom: boolean = false;

  // Blockchain data will be fetched from this block height
  // Set this null to start fetching from the latest block
  @Column({ nullable: true })
  startBlockHeight?: number | null = 0;

  @AfterLoad()
  unSerializeJsonFields() {
    this.gateway = serializeEmbeddedTypeORMEntity(
      new GatewayConfigurationEntity(),
      this.gateway
    );
    this.emulator = serializeEmbeddedTypeORMEntity(
      new EmulatorConfigurationEntity(),
      this.emulator
    );
  }

  @AfterLoad()
  temporaryOverWriteGatewayConfig() {
    if (this.isFlowserManagedEmulator()) {
      // fcl connects to a REST API provided by accessNode.api
      this.gateway = new GatewayConfigurationEntity("http://127.0.0.1", 8080);
    } else if (this.isUserManagedEmulator()) {
      // user must run emulator on non-default flow emulator port
      this.gateway.port = config.userManagedEmulatorPort;
    }
  }

  static init(dto: CreateProjectDto) {
    return Object.assign(new Project(), {
      id: toKebabCase(dto.name),
      ...dto,
    });
  }

  hasGatewayConfiguration() {
    return this.gateway !== null;
  }

  hasEmulatorConfiguration() {
    return this.emulator !== null;
  }

  isStartBlockHeightDefined() {
    return this.startBlockHeight !== null;
  }

  isEmulator() {
    return this.isAnyNetwork([FlowNetworks.EMULATOR]);
  }

  isOfficialNetwork() {
    return this.isAnyNetwork([FlowNetworks.MAINNET, FlowNetworks.TESTNET]);
  }

  isUserManagedEmulator() {
    return this.id === "emulator";
  }

  isFlowserManagedEmulator() {
    return (
      this.isAnyNetwork([FlowNetworks.EMULATOR]) &&
      !this.isUserManagedEmulator()
    );
  }

  isAnyNetwork(networks: FlowNetworks[]) {
    // network type is determined by project.id
    // only managed emulator projects can have arbitrary id values
    // for other projects network type must equal to it's id
    const officialNetworkIds = ["mainnet", "testnet"];
    for (let network of networks) {
      let isMatch = false;
      if (network === FlowNetworks.EMULATOR) {
        isMatch = !officialNetworkIds.includes(this.id);
      } else {
        isMatch = this.id === network;
      }
      if (isMatch) {
        return true;
      }
    }
    return false;
  }
}
