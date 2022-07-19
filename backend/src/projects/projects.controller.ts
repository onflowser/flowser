import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Project } from "./entities/project.entity";
import { defaultEmulatorFlags } from "./data/default-emulator-flags";
import { ApiParam } from "@nestjs/swagger";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(Project.init(createProjectDto));
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get("current")
  findCurrent() {
    return this.projectsService.getCurrentProject();
  }

  @Get("/default")
  async default() {
    return defaultEmulatorFlags;
  }

  @ApiParam({ name: "id", type: String })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.projectsService.findOne(id);
  }

  @ApiParam({ name: "id", type: String })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete("/use")
  async unUseProject(@Param("id") id: string): Promise<void> {
    // no need to wait for the completion
    this.projectsService.cleanupProject();
  }

  @ApiParam({ name: "id", type: String })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.projectsService.remove(id);
  }

  @ApiParam({ name: "id", type: String })
  @Post("/use/:id")
  async useProject(@Param("id") id: string): Promise<Project> {
    return await this.projectsService.useProject(id);
  }

  @ApiParam({ name: "id", type: String })
  @Post("/:id/seed/accounts")
  async seed(@Param("id") id: string, @Query("n", ParseIntPipe) n: number) {
    return this.projectsService.seedAccounts(id, n);
  }
}
