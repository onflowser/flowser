import {
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

@Injectable()
export class ProjectsService {

    private currentProject: Project;

    constructor(
      @InjectRepository(Project)
      private projectRepository: MongoRepository<Project>,
      private flowGatewayService: FlowGatewayService,
      private flowAggregatorService: FlowAggregatorService
      ) {
        this.useProject("emulator") // default project for dev
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
        } catch (e) {
            const description = `Can not use project with id '${id}'`;
            throw new NotFoundException(e, description);
        }
    }

    create(createProjectDto: CreateProjectDto) {
        return this.projectRepository.insert(createProjectDto);
    }

    findAll(): Promise<Project[]> {
        return this.projectRepository.find();
    }

    findOne(id: string): Promise<Project> {
        return this.projectRepository.findOne({ id });
    }

    update(id: number, updateProjectDto: UpdateProjectDto) {
        return `This action updates a #${id} project`;
    }

    remove(id: number) {
        return `This action removes a #${id} project`;
    }
}
