import { AfterLoad, Column, Entity, Index, PrimaryColumn } from "typeorm";
import { GatewayConfigurationEntity } from "./gateway-configuration.entity";
import { serializeEmbeddedTypeORMEntity, toKebabCase } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { EmulatorConfigurationEntity } from "./emulator-configuration.entity";
import { PollingEntity } from "../../common/entities/polling.entity";
import { Project } from "@flowser/types/generated/entities/projects";
import { plainToInstance } from "class-transformer";

@Entity({ name: "projects" })
export class ProjectEntity extends PollingEntity {
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
  emulator: EmulatorConfigurationEntity | null;

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

  toProto() {
    return Project.fromPartial({
      id: this.id,
      name: this.name,
      pingable: this.pingable,
      isCustom: this.isCustom,
      startBlockHeight: this.startBlockHeight,
      gateway: this.gateway?.toProto(),
      emulator: this.emulator?.toProto(),
    });
  }

  static create(projectDto: CreateProjectDto) {
    const project = new ProjectEntity();
    project.id = toKebabCase(projectDto.name);
    project.name = projectDto.name;
    project.startBlockHeight = projectDto.startBlockHeight;
    project.isCustom = projectDto.isCustom;
    project.gateway = plainToInstance(
      GatewayConfigurationEntity,
      projectDto.gateway
    );
    project.emulator = plainToInstance(
      EmulatorConfigurationEntity,
      projectDto.emulator
    );
    return project;
  }
}
