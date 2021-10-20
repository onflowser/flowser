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
            if (this.currentProject.emulator) {
                this.flowEmulatorService.configureProjectContext(this.currentProject)
                this.flowAggregatorService.startEmulator(); // TODO: test this
            }
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
        try {
            return this.projectRepository.save(createProjectDto);
        } catch (e) {
            return e;
        }
    }

    async findAll(): Promise<Project[]> {
        const projects = await this.projectRepository.find();
        return Promise.all(projects.map(async project => {
            const {address, port} = project.gateway;
            return {
                ...project,
                pingable: await FlowGatewayService.isPingable(address, port)
            }
        }))

    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ id });
        if (!project) {
            throw new NotFoundException("Project not found")
        }
        const {port, address} = project.gateway;
        return {
            ...project,
            pingable: await FlowGatewayService.isPingable(address, port)
        };
    }

    update(id: string, updateProjectDto: UpdateProjectDto) {
        return this.projectRepository.update({ id }, updateProjectDto);
    }

    remove(id: string) {
        return this.projectRepository.delete({ id });
    }
}
