import { Column, Entity, Index, ObjectIdColumn } from "typeorm";
import { GatewayConfigurationEntity } from "./gateway-configuration.entity";
import { toKebabCase } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { EmulatorConfigurationEntity } from "./emulator-configuration.entity";
import { PollingEntity } from "../../shared/entities/polling.entity";
import { Type } from "class-transformer";

export enum FlowNetworks {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  EMULATOR = "emulator",
}

@Entity({ name: "projects" })
export class Project extends PollingEntity {
  @ObjectIdColumn()
  _id: string;

  @Column()
  @Index({ unique: true })
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column()
  pingable: boolean;

  @Column()
  @Type(() => GatewayConfigurationEntity)
  gateway: GatewayConfigurationEntity;

  @Column()
  @Type(() => EmulatorConfigurationEntity)
  emulator: EmulatorConfigurationEntity;

  @Column("boolean", { default: false })
  isCustom: boolean = false;

  // data will be fetched from this block height
  // set this undefined to start fetching from latest block
  @Column()
  startBlockHeight?: number | undefined = 0;

  static init(dto: CreateProjectDto) {
    return Object.assign(new Project(), {
      id: toKebabCase(dto.name),
      ...dto,
    });
  }

  isStartBlockHeightDefined() {
    return (
      this.startBlockHeight !== undefined && this.startBlockHeight !== null
    );
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
