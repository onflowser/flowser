import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MongoRepository } from 'typeorm';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FlowGatewayService } from "../flow/services/flow-gateway.service";
import { FlowAggregatorService } from "../flow/services/flow-aggregator.service";
import { FlowEmulatorService } from "../flow/services/flow-emulator.service";

@Injectable()
export class ProjectsService {

    private currentProject: Project;

    constructor(
      @InjectRepository(Project)
      private projectRepository: MongoRepository<Project>,
      private flowGatewayService: FlowGatewayService,
      private flowAggregatorService: FlowAggregatorService,
      private flowEmulatorService: FlowEmulatorService
      ) {
        try {
            this.useProject("emulator") // default project for dev
        } catch (e) {
            console.error(`[Flowser] failed to use default project: `, e)
        }
    }

    getCurrentProject() {
        if (this.currentProject) {
            return this.currentProject;
        } else {
            throw new NotFoundException("No current project")
        }
    }

    async useProject(id: string) {
        try {
            this.currentProject = await this.findOne(id);
            // update project context
            this.flowGatewayService.configureDataSourceGateway(this.currentProject.gateway);
            this.flowAggregatorService.configureProjectContext(this.currentProject);
            this.flowEmulatorService.configureProjectContext(this.currentProject)
            this.flowAggregatorService.startEmulator(); // TODO: test this
            console.debug(`[Flowser] using project: ${id}`)
        } catch (e) {
            const description = `Can not use project with id '${id}'`;
            throw new NotFoundException(e, description);
        }
    }

    async seedAccounts(id: string, n: number) {
        if (this.currentProject.id === id) {
            return this.flowEmulatorService.initialiseAccounts(n);
        } else {
            throw new ConflictException("This project is not currently used.")
        }
    }

    create(createProjectDto: CreateProjectDto) {
        return this.projectRepository.insert(createProjectDto);
    }

    findAll(): Promise<Project[]> {
        return this.projectRepository.find();
    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ id });
        if (!project) {
            throw new NotFoundException("Project not found")
        }
        return project;
    }

    update(id: number, updateProjectDto: UpdateProjectDto) {
        return `This action updates a #${id} project`;
    }

    remove(id: number) {
        return `This action removes a #${id} project`;
    }
}
