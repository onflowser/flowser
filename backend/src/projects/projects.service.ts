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
import { Repository } from "typeorm";
import { Project } from "./entities/project.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FlowGatewayService } from "../flow/services/flow-gateway.service";
import { FlowAggregatorService } from "../flow/services/flow-aggregator.service";
import { FlowEmulatorService } from "../flow/services/flow-emulator.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { BlocksService } from "../blocks/blocks.service";
import { EventsService } from "../events/events.service";
import { LogsService } from "../logs/logs.service";
import { TransactionsService } from "../transactions/transactions.service";
import { FlowCliService } from "../flow/services/flow-cli.service";
import { plainToClass } from "class-transformer";
import { StorageDataService } from "../flow/services/storage-data.service";
import config from "../config";
import { GatewayConfigurationEntity } from "./entities/gateway-configuration.entity";
import { defaultProjects } from "./data/seeds";

@Injectable()
export class ProjectsService {
  private currentProject: Project;
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private flowGatewayService: FlowGatewayService,
    private flowAggregatorService: FlowAggregatorService,
    private flowEmulatorService: FlowEmulatorService,
    private flowCliService: FlowCliService,
    private accountsService: AccountsService,
    private blocksService: BlocksService,
    private eventsService: EventsService,
    private logsService: LogsService,
    private transactionsService: TransactionsService,
    private storageDataService: StorageDataService
  ) {}

  seedDefaultProjects() {
    return this.projectRepository
      .save(
        defaultProjects.map((project) => Object.assign(new Project(), project))
      )
      .catch(this.handleDatabaseError);
  }

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
      // TODO: persist data for projects with "persist" flag
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
    this.flowAggregatorService.configureProjectContext(this.currentProject);
    this.flowGatewayService.configureDataSourceGateway(
      this.currentProject?.gateway
    );

    // user may have previously used a custom emulator project
    // make sure that in any running emulators are stopped
    await this.flowAggregatorService.stopEmulator();
    this.storageDataService.stop();
  }

  async useProject(id: string) {
    await this.cleanupProject();

    this.currentProject = await this.findOne(id);

    // update project context
    this.flowGatewayService.configureDataSourceGateway(
      this.currentProject?.gateway
    );
    this.flowAggregatorService.configureProjectContext(this.currentProject);

    if (this.currentProject.hasEmulatorConfiguration()) {
      this.flowCliService.configure(id, this.currentProject.emulator);
      this.flowEmulatorService.configureProjectContext(this.currentProject);
      await this.flowCliService.cleanup(); // ensure clean environment

      try {
        await this.flowAggregatorService.startEmulator();
      } catch (e) {
        throw new ServiceUnavailableException(
          `Can not start emulator with project ${id}`,
          e.message
        );
      }

      try {
        await this.storageDataService.start();
      } catch (e) {
        throw new ServiceUnavailableException(
          "Data storage service error",
          e.message
        );
      }
    }

    this.logger.debug(`using project: ${id}`);

    return this.currentProject;
  }

  async seedAccounts(id: string, n: number) {
    if (this.currentProject.id === id) {
      return this.flowEmulatorService.initialiseAccounts(n);
    } else {
      throw new ConflictException("This project is not currently used.");
    }
  }

  create(createProjectDto: CreateProjectDto) {
    return this.projectRepository
      .save(createProjectDto)
      .catch(this.handleDatabaseError);
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectRepository.find({
      order: { updatedAt: "DESC" },
    });
    return Promise.all(
      projects.map(async (project) => this.setComputedFields(project))
    );
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOneByOrFail({ id });
    return this.setComputedFields(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.projectRepository
      .upsert(
        { ...updateProjectDto, updatedAt: new Date() },
        {
          conflictPaths: ["id"],
        }
      )
      .catch(this.handleDatabaseError);
  }

  async remove(id: string) {
    if (this.currentProject?.id === id) {
      await this.cleanupProject();
    }
    return this.projectRepository.delete({ id });
  }

  private async setComputedFields(project: Project) {
    if (project.hasGatewayConfiguration()) {
      const { address, port } = project.gateway;
      const pingable =
        project.isOfficialNetwork() ||
        (await FlowGatewayService.isPingable(address, port));
      return plainToClass(Project, { ...project, pingable });
    } else {
      return project;
    }
  }

  private handleDatabaseError(error) {
    // TODO: how to handle error for SQL
    switch (error.code) {
      case 11000:
        throw new ConflictException("Project name already exists");
      default:
        throw new InternalServerErrorException(error.message);
    }
  }
}
