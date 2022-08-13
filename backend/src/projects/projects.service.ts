import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
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
import { LogsService } from "../logs/logs.service";
import { TransactionsService } from "../transactions/transactions.service";
import { FlowCliService } from "../flow/services/cli.service";
import { plainToClass } from "class-transformer";
import { ContractsService } from "../accounts/services/contracts.service";
import { KeysService } from "../accounts/services/keys.service";
import { FlowConfigService } from "../flow/services/config.service";

@Injectable()
export class ProjectsService {
  private currentProject: ProjectEntity;
  private readonly logger = new Logger(ProjectsService.name);

  // It would be better to set up a different mechanism for sharing project context
  // But for now let's remember to put all services that need project context in this array
  private readonly servicesWithProjectContext = [
    this.flowCliService,
    this.flowGatewayService,
    this.flowConfigService,
    this.flowAggregatorService,
    this.flowEmulatorService,
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
    private contractsService: ContractsService,
    private blocksService: BlocksService,
    private eventsService: EventsService,
    private logsService: LogsService,
    private transactionsService: TransactionsService
  ) {}

  getCurrentProject() {
    if (this.currentProject) {
      return this.currentProject;
    } else {
      throw new NotFoundException("No current project");
    }
  }

  async cleanupProject() {
    try {
      // remove all existing data of previously used project
      // TODO(milestone-3): persist data for projects by default?

      // Remove contracts before removing accounts, because of the foreign key constraint.
      await Promise.all([
        this.contractsService.removeAll(),
        this.accountKeysService.removeAll(),
      ]);
      await Promise.all([
        this.accountsService.removeAll(),
        this.blocksService.removeAll(),
        this.eventsService.removeAll(),
        this.logsService.removeAll(),
        this.transactionsService.removeAll(),
      ]);
    } catch (e) {
      throw new InternalServerErrorException("Database cleanup failed");
    }

    this.currentProject = undefined;

    // user may have previously used a custom emulator project
    // make sure that in any running emulators are stopped
    await this.flowAggregatorService.stopEmulator();
  }

  async useProject(id: string) {
    await this.cleanupProject();

    this.currentProject = await this.findOne(id);

    // TODO(milestone-3): validate that project has a valid flow.json config

    // Provide project context to services that need it
    this.servicesWithProjectContext.forEach((service) => {
      service.setProjectContext(this.currentProject);
    });

    if (this.currentProject.hasEmulatorConfiguration()) {
      try {
        await this.flowAggregatorService.startEmulator();
      } catch (e: any) {
        throw new ServiceUnavailableException(
          `Can not start emulator with project ${id}`,
          e.message
        );
      }

      try {
        // TODO(milestone-3): start new storage service that uses Emulator storage API
        // await this.storageDataService.start();
      } catch (e: any) {
        throw new ServiceUnavailableException(
          "Data storage service error",
          e.message
        );
      }
    }

    this.logger.debug(`using project: ${id}`);

    return this.currentProject;
  }

  async create(createProjectDto: CreateProjectDto) {
    const project = ProjectEntity.create(createProjectDto);
    await this.projectRepository
      .insert(project)
      .catch(this.handleDatabaseError);
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
    await this.projectRepository
      .update({ id }, project)
      .catch(this.handleDatabaseError);
    return project;
  }

  async remove(id: string) {
    if (this.currentProject?.id === id) {
      await this.cleanupProject();
    }
    return this.projectRepository.delete({ id });
  }

  private async setComputedFields(project: ProjectEntity) {
    if (project.hasGatewayConfiguration()) {
      const { address, port } = project.gateway;
      // Assume non emulator networks are pingable
      const pingable = project.hasEmulatorGateway()
        ? await FlowGatewayService.isPingable(address, port)
        : true;
      return plainToClass(ProjectEntity, { ...project, pingable });
    } else {
      return project;
    }
  }

  private handleDatabaseError(error) {
    // TODO(milestone-3): how to handle errors for SQL
    switch (error.code) {
      case 11000:
        throw new ConflictException("Project name already exists");
      default:
        throw new InternalServerErrorException(error.message);
    }
  }
}
