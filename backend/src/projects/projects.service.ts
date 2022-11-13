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
import { FlowAggregatorService } from "../flow/services/aggregator.service";
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
  Emulator,
  Gateway,
  GatewayStatus,
  HashAlgorithm,
  Project,
  ProjectRequirement,
  ProjectRequirementType,
  SignatureAlgorithm,
  GetProjectStatusResponse,
} from "@flowser/shared";
import * as fs from "fs";
import { CommonService } from "../core/services/common.service";
import { FlowDevWalletService } from "../flow/services/dev-wallet.service";

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
      // Config service must be defined before cli service!
      this.flowConfigService,
      this.flowCliService,
      this.flowGatewayService,
      this.flowAggregatorService,
      this.flowEmulatorService,
      this.flowDevWalletService,
    ];

  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
    private flowGatewayService: FlowGatewayService,
    private flowAggregatorService: FlowAggregatorService,
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
    private commonService: CommonService,
    private flowDevWalletService: FlowDevWalletService
  ) {}

  getCurrentProject() {
    if (this.currentProject) {
      return this.currentProject;
    } else {
      throw new NotFoundException("No current project");
    }
  }

  async getProjectStatus(): Promise<GetProjectStatusResponse> {
    const totalBlocksToProcess =
      await this.flowAggregatorService.getTotalBlocksToProcess();
    return {
      totalBlocksToProcess,
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

    const flowCliInfo = await this.flowCliService.getInfo();
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

  async usePersistedProject(id: string) {
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
    const project = await this.projectRepository.findOneByOrFail({ id });
    return this.setComputedFields(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = ProjectEntity.create(updateProjectDto);
    project.markUpdated();
    await this.projectRepository.update({ id }, project);
    return project;
  }

  async remove(id: string) {
    if (this.currentProject?.id === id) {
      await this.cleanupProject();
    }
    return this.projectRepository.delete({ id });
  }

  async getDefaultProject() {
    const restServerPort = 8888;
    const grpcServerPort = 3569;

    const isWindows = process.platform === "win32";

    return Project.fromPartial({
      name: "New Project",
      gateway: Gateway.fromPartial({
        restServerAddress: `http://localhost:${restServerPort}`,
        grpcServerAddress: `http://localhost:${grpcServerPort}`,
      }),
      devWallet: DevWallet.fromJSON({
        run: true,
        port: 8701,
      }),
      emulator: Emulator.fromPartial({
        run: true,
        verboseLogging: true,
        restServerPort,
        grpcServerPort,
        adminServerPort: 8080,
        persist: false,
        // Snapshot should be temporarily disabled on Windows
        // See https://github.com/onflow/flow-emulator/issues/208
        snapshot: !isWindows,
        withContracts: false,
        blockTime: 0,
        servicePrivateKey: undefined,
        databasePath: "./flowdb",
        tokenSupply: 1000000000,
        transactionExpiry: 10,
        storagePerFlow: undefined,
        minAccountBalance: undefined,
        transactionMaxGasLimit: 9999,
        scriptGasLimit: 100000,
        serviceSignatureAlgorithm: SignatureAlgorithm.ECDSA_P256,
        serviceHashAlgorithm: HashAlgorithm.SHA3_256,
        storageLimit: true,
        transactionFees: false,
        simpleAddresses: false,
      }),
    });
  }

  private async setComputedFields(project: ProjectEntity) {
    if (project.hasGatewayConfiguration()) {
      // Assume non-emulator networks are always online
      project.gateway.status = project.shouldRunEmulator()
        ? await FlowGatewayService.getGatewayStatus(project.gateway)
        : GatewayStatus.GATEWAY_STATUS_ONLINE;
    }
    return project;
  }
}
