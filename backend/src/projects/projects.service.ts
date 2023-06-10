import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  PreconditionFailedException,
} from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { MoreThan, Repository } from "typeorm";
import { ProjectEntity } from "./entities/project.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FlowGatewayService } from "../flow/services/gateway.service";
import { ProcessorService } from "../data-processing/services/processor.service";
import { FlowEmulatorService } from "../flow/services/emulator.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { BlocksService } from "../blocks/blocks.service";
import { EventsService } from "../events/events.service";
import { TransactionsService } from "../transactions/transactions.service";
import { FlowCliService } from "../flow/services/cli.service";
import { ContractsService } from "../accounts/services/contracts.service";
import { KeysService } from "../accounts/services/keys.service";
import { FlowConfigService } from "../flow/services/config.service";
import { ProjectContextLifecycle } from "../flow/utils/project-context";
import { AccountStorageService } from "../accounts/services/storage.service";
import {
  DevWallet,
  Gateway,
  ServiceStatus,
  GetProjectStatusResponse,
  Project,
  ProjectRequirement,
  ProjectRequirementType,
} from "@flowser/shared";
import * as fs from "fs";
import { DataRemovalService } from "../core/services/data-removal.service";
import { FlowDevWalletService } from "../flow/services/dev-wallet.service";
import { WalletService } from "../wallet/wallet.service";
import { FlowSnapshotService } from "../flow/services/snapshot.service";

const commandExists = require("command-exists");
const semver = require("semver");

@Injectable()
export class ProjectsService {
  private currentProject: ProjectEntity;
  private readonly logger = new Logger(ProjectsService.name);

  // For now let's not forget to manually add services with ProjectContextLifecycle interface
  // Order is important, because some actions have dependencies
  private readonly servicesWithProjectLifecycleContext: ProjectContextLifecycle[] =
    [
      this.flowConfigService,
      // Below services depend on flow config service,
      // so they must be configured after the above one.
      this.flowCliService,
      this.walletService,

      this.flowGatewayService,
      this.flowAggregatorService,
      this.flowEmulatorService,
      this.flowDevWalletService,
      // Snapshot service must be started after emulator service,
      // as it depends on REST APIs that emulator process exposes.
      this.flowSnapshotsService,
    ];

  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
    private flowGatewayService: FlowGatewayService,
    private flowAggregatorService: ProcessorService,
    private flowEmulatorService: FlowEmulatorService,
    private flowCliService: FlowCliService,
    private flowConfigService: FlowConfigService,
    private accountsService: AccountsService,
    private accountKeysService: KeysService,
    private accountStorageService: AccountStorageService,
    private contractsService: ContractsService,
    private blocksService: BlocksService,
    private eventsService: EventsService,
    private transactionsService: TransactionsService,
    private commonService: DataRemovalService,
    private flowDevWalletService: FlowDevWalletService,
    private walletService: WalletService,
    private flowSnapshotsService: FlowSnapshotService
  ) {}

  getCurrentProject(): ProjectEntity | undefined {
    return this.currentProject;
  }

  getCurrentProjectOrFail() {
    if (this.currentProject) {
      return this.currentProject;
    } else {
      throw new NotFoundException("No current project");
    }
  }

  async getProjectStatus(): Promise<GetProjectStatusResponse> {
    if (!this.currentProject) {
      throw new NotFoundException("No current project");
    }
    if (!this.currentProject.gateway) {
      throw new PreconditionFailedException("Gateway not configured");
    }
    const flowApiStatus = await FlowGatewayService.getApiStatus(
      this.currentProject.gateway
    );
    const devWalletApiStatus = await FlowDevWalletService.getApiStatus(
      this.currentProject.devWallet
    );
    const totalBlocksToProcess =
      flowApiStatus === ServiceStatus.SERVICE_STATUS_ONLINE
        ? await this.flowAggregatorService.getTotalBlocksToProcess()
        : -1;
    return {
      totalBlocksToProcess,
      flowApiStatus,
      devWalletApiStatus,
    };
  }

  async getMissingRequirements(): Promise<ProjectRequirement[]> {
    const missingRequirements: ProjectRequirement[] = [];
    try {
      await commandExists("flow");
    } catch (e) {
      missingRequirements.push(
        ProjectRequirement.fromPartial({
          type: ProjectRequirementType.PROJECT_REQUIREMENT_MISSING_FLOW_CLI,
        })
      );
      return missingRequirements;
    }

    const flowCliInfo = await this.flowCliService.getVersion();
    const foundVersion = semver.coerce(flowCliInfo.version).version;
    const minSupportedVersion = "0.41.1";
    const isSupportedFlowCliVersion = semver.lte(
      minSupportedVersion,
      foundVersion
    );
    if (!isSupportedFlowCliVersion) {
      missingRequirements.push({
        type: ProjectRequirementType.PROJECT_REQUIREMENT_UNSUPPORTED_FLOW_CLI_VERSION,
        missingVersionRequirement: {
          minSupportedVersion,
          foundVersion,
        },
      });
    }

    return missingRequirements;
  }

  async cleanupProject() {
    try {
      // Remove all cached data of previously used project
      await this.commonService.removeBlockchainData();
    } catch (e) {
      throw new InternalServerErrorException("Database cleanup failed");
    }

    this.currentProject = undefined;
    await Promise.all(
      this.servicesWithProjectLifecycleContext.map((service) =>
        service.onExitProjectContext()
      )
    );
  }

  async useProjectById(id: string) {
    const targetProject = await this.findOne(id);
    return this.useProject(targetProject);
  }

  async useProject(project: ProjectEntity) {
    await this.cleanupProject();

    this.currentProject = project;

    // TODO(milestone-3): validate that project has a valid flow.json config

    // Provide project context to services that need it
    try {
      for (const service of this.servicesWithProjectLifecycleContext) {
        await service.onEnterProjectContext(this.currentProject);
      }
    } catch (e: unknown) {
      this.logger.debug("Project context initialization failed", e);
      throw new InternalServerErrorException(
        e ?? "Project context initialization failed"
      );
    }

    this.logger.debug(`using project: ${project.id}`);

    return this.currentProject;
  }

  async create(createProjectDto: CreateProjectDto) {
    const projectFolderExists = fs.existsSync(createProjectDto.filesystemPath);
    if (!projectFolderExists) {
      throw new PreconditionFailedException("Project folder not found");
    }
    const project = ProjectEntity.create(createProjectDto);
    await this.projectRepository.insert(project);
    return project;
  }

  async findAll(): Promise<ProjectEntity[]> {
    const projects = await this.projectRepository.find({
      order: { updatedAt: "DESC" },
    });
    return Promise.all(
      projects.map(async (project) => this.setComputedFields(project))
    );
  }

  findAllNewerThanTimestamp(timestamp: Date): Promise<ProjectEntity[]> {
    return this.projectRepository.find({
      where: [
        { createdAt: MoreThan(timestamp) },
        { updatedAt: MoreThan(timestamp) },
      ],
      order: { updatedAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<ProjectEntity> {
    const currentProject = this.getCurrentProject();
    // Project can be persisted only in-memory
    if (currentProject?.id === id) {
      return currentProject;
    }
    const project = await this.projectRepository.findOneByOrFail({ id });
    return this.setComputedFields(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const currentProject = this.getCurrentProject();
    const project = ProjectEntity.create(updateProjectDto);
    project.markUpdated();

    // Project can be persisted only in-memory
    if (currentProject?.id === id) {
      this.currentProject = project;
      return this.currentProject;
    }

    await this.projectRepository.update(
      { id },
      // Prevent overwriting existing created date
      { ...project, createdAt: undefined }
    );
    return project;
  }

  async remove(id: string) {
    if (this.currentProject?.id === id) {
      await this.cleanupProject();
    }
    return this.projectRepository.delete({ id });
  }

  getDefaultProject() {
    const defaultEmulator = FlowEmulatorService.getDefaultFlags();

    return Project.fromPartial({
      name: "New Project",
      gateway: Gateway.fromPartial({
        restServerAddress: `http://localhost:${defaultEmulator.restServerPort}`,
        grpcServerAddress: `http://localhost:${defaultEmulator.grpcServerPort}`,
      }),
      devWallet: DevWallet.fromJSON({
        port: 8701,
      }),
      emulator: defaultEmulator,
    });
  }

  private async setComputedFields(project: ProjectEntity) {
    if (project.hasGatewayConfiguration()) {
      project.gateway.status = await FlowGatewayService.getApiStatus(
        project.gateway
      );
    }
    return project;
  }
}
