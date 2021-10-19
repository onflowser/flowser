import {
    Body,
    Controller,
    Delete,
    Get,
    Param, ParseIntPipe,
    Patch,
    Post,
    Query,
    UnprocessableEntityException
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from "./entities/project.entity";
import { defaultEmulatorFlags } from './data/default-emulator-flags';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {
    }

    @Post()
    async create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(Project.init(createProjectDto));
    }

    @Get()
    findAll() {
        return this.projectsService.findAll();
    }

    @Get('current')
    findCurrent() {
        return this.projectsService.getCurrentProject();
    }

    @Get('/default')
    async default() {
        return defaultEmulatorFlags;

    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.projectsService.remove(+id);
    }

    @Post('/use/:id')
    async useProject(@Param('id') id: string):Promise<void> {
        return this.projectsService.useProject(id);
    }

    @Post('/:id/seed/accounts')
    async seed(@Param('id') id: string, @Query("n", ParseIntPipe) n: number) {
        return this.projectsService.seedAccounts(id, n);
    }
}
