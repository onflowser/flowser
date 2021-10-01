import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowModule } from "../flow/flow.module";

@Module({
    imports: [
      TypeOrmModule.forFeature([Project]),
      FlowModule
    ],
    controllers: [ProjectsController],
    providers: [
        ProjectsService
    ]
})
export class ProjectsModule {
}
