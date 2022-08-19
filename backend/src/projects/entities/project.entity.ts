import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { toKebabCase, typeOrmProtobufTransformer } from "../../utils";
import { CreateProjectDto } from "../dto/create-project.dto";
import { PollingEntity } from "../../common/entities/polling.entity";
import {
  DevWallet,
  Emulator,
  Gateway,
  Project,
} from "@flowser/types/generated/entities/projects";
import { UpdateProjectDto } from "../dto/update-project.dto";
import { DevWalletConfigurationDto } from "../dto/dev-wallet-configuration.dto";

@Entity({ name: "projects" })
export class ProjectEntity extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column()
  filesystemPath: string;

  @Column("simple-json", {
    nullable: true,
    transformer: typeOrmProtobufTransformer(DevWallet),
  })
  devWallet: DevWallet;

  // TODO(milestone-3): gateway should be synced with network settings in flow.json
  @Column("simple-json", {
    nullable: true,
    transformer: typeOrmProtobufTransformer(Gateway),
  })
  gateway: Gateway;

  // TODO(milestone-3): emulator should be synced with settings in flow.json
  @Column("simple-json", {
    nullable: true,
    transformer: typeOrmProtobufTransformer(Emulator),
  })
  emulator: Emulator | null;

  // Blockchain data will be fetched from this block height
  // Set this null to start fetching from the latest block
  @Column({ nullable: true })
  startBlockHeight: number | null = 0;

  hasGatewayConfiguration() {
    return this.gateway !== null;
  }

  hasEmulatorConfiguration() {
    return this.emulator !== null;
  }

  isStartBlockHeightDefined() {
    return this.startBlockHeight !== null;
  }

  shouldRunEmulator() {
    // Testnet usage is in beta, main-net won't be support
    // TODO(milestone-3): How to handle network type detection?
    return this.emulator?.run;
  }

  toProto() {
    return Project.fromPartial({
      id: this.id,
      name: this.name,
      filesystemPath: this.filesystemPath,
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
    project.filesystemPath = projectDto.filesystemPath;
    project.gateway = projectDto.gateway
      ? Gateway.fromJSON(projectDto.gateway)
      : Gateway.fromPartial({
          restServerAddress: `http://localhost:${projectDto.emulator.restServerPort}`,
          grpcServerAddress: `http://localhost:${projectDto.emulator.grpcServerPort}`,
        });
    project.devWallet = DevWallet.fromPartial(projectDto.devWallet);
    project.emulator = Emulator.fromJSON(projectDto.emulator);
    return project;
  }
}
