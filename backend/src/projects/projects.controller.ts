import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ApiParam } from "@nestjs/swagger";
import {
  GetAllProjectsResponse,
  GetSingleProjectResponse,
  GetPollingProjectsResponse,
  UseProjectResponse,
  UpdateProjectResponse,
  CreateProjectResponse,
  GetPollingProjectsRequest,
  GetProjectRequirementsResponse,
  GetProjectStatusResponse,
} from "@flowser/shared";
import { PollingResponseInterceptor } from "../core/interceptors/polling-response.interceptor";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    const project = await this.projectsService.create(createProjectDto);
    return CreateProjectResponse.toJSON(
      CreateProjectResponse.fromPartial({
        project: project.toProto(),
      })
    );
  }

  @Get("requirements")
  async getProjectRequirements() {
    return GetProjectRequirementsResponse.toJSON({
      missingRequirements: await this.projectsService.getMissingRequirements(),
    });
  }

  @Get("status")
  async getStatus() {
    const statusResponse = await this.projectsService.getProjectStatus();
    return GetProjectStatusResponse.toJSON(statusResponse);
  }

  @Get()
  async findAll() {
    const projects = await this.projectsService.findAll();
    return GetAllProjectsResponse.toJSON(
      GetAllProjectsResponse.fromPartial({
        projects: projects.map((project) => project.toProto()),
      })
    );
  }

  @Post("polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingProjectsResponse))
  async findAllNew(@Body() data: unknown) {
    const request = GetPollingProjectsRequest.fromJSON(data);
    const projects = await this.projectsService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return projects.map((project) => project.toProto());
  }

  @Get("current")
  async findCurrent() {
    const project = this.projectsService.getCurrentProjectOrFail();
    return GetSingleProjectResponse.toJSON(
      GetSingleProjectResponse.fromPartial({
        project: project.toProto(),
      })
    );
  }

  @Get("default")
  async default() {
    return GetSingleProjectResponse.toJSON(
      GetSingleProjectResponse.fromPartial({
        project: this.projectsService.getDefaultProject(),
      })
    );
  }

  @ApiParam({ name: "id", type: String })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const project = await this.projectsService.findOne(id);
    return GetSingleProjectResponse.fromPartial({
      project: project.toProto(),
    });
  }

  @ApiParam({ name: "id", type: String })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    const project = await this.projectsService.update(id, updateProjectDto);
    return UpdateProjectResponse.toJSON(
      UpdateProjectResponse.fromPartial({
        project: project.toProto(),
      })
    );
  }

  @Delete("/use")
  async unUseProject(@Param("id") id: string): Promise<void> {
    // no need to wait for the completion
    this.projectsService.cleanupProject();
  }

  @ApiParam({ name: "id", type: String })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.projectsService.remove(id);
  }

  @ApiParam({ name: "id", type: String })
  @Post("/use/:id")
  async useProject(@Param("id") id: string) {
    const project = await this.projectsService.useProjectById(id);
    return UseProjectResponse.toJSON(
      UseProjectResponse.fromPartial({
        project: project.toProto(),
      })
    );
  }
}
