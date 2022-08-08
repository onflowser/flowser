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
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectEntity } from "./entities/project.entity";
import { defaultEmulatorFlags } from "./data/default-emulator-flags";
import { ApiParam } from "@nestjs/swagger";
import {
  GetAllProjectsResponse,
  GetSingleProjectResponse,
} from "@flowser/types/generated/responses/projects";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    const project = await this.projectsService.create(
      ProjectEntity.create(createProjectDto)
    );
    return GetSingleProjectResponse.toJSON({
      project: project.toProto(),
    });
  }

  @Get()
  async findAll() {
    const projects = await this.projectsService.findAll();
    return GetAllProjectsResponse.fromPartial({
      projects: projects.map((project) => project.toProto()),
    });
  }

  @Get("current")
  async findCurrent() {
    const project = await this.projectsService.getCurrentProject();
    return GetSingleProjectResponse.fromPartial({
      project: project.toProto(),
    });
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
  async update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    const project = await this.projectsService.update(id, updateProjectDto);
    return GetSingleProjectResponse.toJSON({
      project: project.toProto(),
    });
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
  async useProject(@Param("id") id: string) {
    const project = await this.projectsService.useProject(id);
    return GetSingleProjectResponse.toJSON({
      project: project.toProto(),
    });
  }

  @ApiParam({ name: "id", type: String })
  @Post("/:id/seed/accounts")
  async seed(@Param("id") id: string, @Query("n", ParseIntPipe) n: number) {
    return this.projectsService.seedAccounts(id, n);
  }
}
