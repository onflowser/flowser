import { AfterLoad, Column, Entity, Index, PrimaryColumn } from "typeorm";
import { GatewayConfigurationEntity } from "./gateway-configuration.entity";
import { serializeEmbeddedTypeORMEntity, toKebabCase } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { EmulatorConfigurationEntity } from "./emulator-configuration.entity";
import { PollingEntity } from "../../common/entities/polling.entity";
import { Project } from "@flowser/types/generated/projects";

@Entity({ name: "projects" })
export class ProjectEntity extends PollingEntity implements Project {
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
  startBlockHeight: number | null = 0;

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

  hasGatewayConfiguration() {
    return this.gateway !== null;
  }

  hasEmulatorConfiguration() {
    return this.emulator !== null;
  }

  isStartBlockHeightDefined() {
    return this.startBlockHeight !== null;
  }

  hasEmulatorGateway() {
    // Testnet usage is in beta, main-net won't be support
    // TODO: better handle emulator gateway detection (address could also be an IP)
    return this.gateway.address.includes("localhost");
  }

  static create(projectDto: CreateProjectDto) {
    return Object.assign(new ProjectEntity(), {
      id: toKebabCase(projectDto.name),
      ...Project.fromJSON(projectDto),
    });
  }
}
