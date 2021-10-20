import {
    ConflictException,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
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
    ) {}

    getCurrentProject() {
        if (this.currentProject) {
            return this.currentProject;
        } else {
            throw new NotFoundException("No current project")
        }
    }

    async useProject(id: string) {
        this.currentProject = await this.findOne(id);
        // update project context
        this.flowGatewayService.configureDataSourceGateway(this.currentProject.gateway);
        this.flowAggregatorService.configureProjectContext(this.currentProject);
        if (!await this.flowGatewayService.isConnectedToGateway()) {
            throw new ServiceUnavailableException("Emulator not accessible")
        }
        try {
            if (this.currentProject.emulator) {
                this.flowEmulatorService.configureProjectContext(this.currentProject)
                this.flowAggregatorService.startEmulator(); // TODO: test this
            }
            console.debug(`[Flowser] using project: ${id}`);
            return this.currentProject;
        } catch (e) {
            throw new ServiceUnavailableException(
              `Can not use project with id ${id}`,
              e.message
            );
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
            if (project.gateway) {
                const {address, port} = project.gateway;
                const pingable = await FlowGatewayService.isPingable(address, port)
                return {
                    ...project,
                    pingable
                }
            } else {
                return project
            }
        }))
    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({id});
        if (!project) {
            throw new NotFoundException("Project not found")
        }

        if (project.gateway) {
            const {port, address} = project.gateway;
            const pingable = await FlowGatewayService.isPingable(address, port)
            return {
                ...project,
                pingable
            };
        } else {
            return project;
        }
    }

    async update(id: string, updateProjectDto: UpdateProjectDto) {
        try {
            const response = await this.projectRepository.findOneAndUpdate({id}, {$set: updateProjectDto}, {
                upsert: true,
                returnOriginal: false
            });
            return response.value;
        } catch (e) {
            return e;
        }
    }

    remove(id: string) {
        return this.projectRepository.delete({ id });
    }
}
