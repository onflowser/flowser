import { AfterLoad, Column, Entity, Index, PrimaryColumn } from "typeorm";
import { toKebabCase } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { PollingEntity } from "../../common/entities/polling.entity";
import { Emulator, Gateway, Project } from "@flowser/types";
import { UpdateProjectDto } from "../dto/update-project.dto";

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
  gateway: Gateway;

  @Column("simple-json", { nullable: true })
  emulator: Emulator | null;

  @Column("boolean", { default: false })
  isCustom: boolean = false;

  // Blockchain data will be fetched from this block height
  // Set this null to start fetching from the latest block
  @Column({ nullable: true })
  startBlockHeight: number | null = 0;

  @AfterLoad()
  unSerializeJsonFields() {
    this.gateway = this.gateway ? Gateway.fromJSON(this.gateway) : null;
    this.emulator = this.emulator ? Emulator.fromJSON(this.emulator) : null;
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
      gateway: this.gateway,
      emulator: this.emulator,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    });
  }

  static create(projectDto: CreateProjectDto | UpdateProjectDto) {
    const project = new ProjectEntity();
    project.id = toKebabCase(projectDto.name);
    project.name = projectDto.name;
    project.startBlockHeight = projectDto.startBlockHeight;
    project.isCustom = projectDto.isCustom;
    project.gateway = projectDto.gateway
      ? Gateway.fromJSON(projectDto.gateway)
      : Gateway.fromPartial({
          port: 8080,
          address: "localhost",
        });
    project.emulator = Emulator.fromJSON(projectDto.emulator);
    return project;
  }
}
