import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProjectsService {

    constructor(@InjectRepository(Project)
                private projectRepository: Repository<Project>) {
    }

    create(createProjectDto: CreateProjectDto) {
        return this.projectRepository.insert(createProjectDto);
    }

    findAll(): Promise<Project[]> {
        return this.projectRepository.find();
    }

    findOne(id: number) {
        return `This action returns a #${id} project`;
    }

    update(id: number, updateProjectDto: UpdateProjectDto) {
        return `This action updates a #${id} project`;
    }

    remove(id: number) {
        return `This action removes a #${id} project`;
    }
}
