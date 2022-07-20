import { AfterLoad, Column, Entity, Index, PrimaryColumn } from "typeorm";
import { GatewayConfigurationEntity } from "./gateway-configuration.entity";
import { toKebabCase } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { EmulatorConfigurationEntity } from "./emulator-configuration.entity";
import { PollingEntity } from "../../shared/entities/polling.entity";

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

  // TODO: use relations instead of embedded entities?
  @Column(() => GatewayConfigurationEntity)
  gateway: GatewayConfigurationEntity;

  @Column(() => EmulatorConfigurationEntity)
  emulator: EmulatorConfigurationEntity;

  @Column("boolean", { default: false })
  isCustom: boolean = false;

  // Blockchain data will be fetched from this block height
  // Set this null to start fetching from the latest block
  @Column({ nullable: true })
  startBlockHeight?: number | null = 0;

  static init(dto: CreateProjectDto) {
    return Object.assign(new Project(), {
      id: toKebabCase(dto.name),
      ...dto,
    });
  }

  hasGatewayConfiguration() {
    // TypeORM embedded entity columns cannot be set to null
    // the only way is to set all the properties of a nested entity to null
    return getNumberOfDefinedProperties(this.gateway) > 0;
  }

  hasEmulatorConfiguration() {
    // TypeORM embedded entity columns cannot be set to null
    // the only way is to set all the properties of a nested entity to null
    return getNumberOfDefinedProperties(this.emulator) > 0;
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

function getNumberOfDefinedProperties(obj: object) {
  return Object.keys(obj).filter((key) => obj[key] !== null).length;
}
