import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  GetProjectObjectsResponse,
  UseProjectResponse,
  CreateProjectResponse,
  GetPollingProjectsRequest,
} from "@flowser/shared";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { FlowConfigService } from "../flow/services/config.service";

@Controller("projects")
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly flowConfigService: FlowConfigService
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    const project = await this.projectsService.create(createProjectDto);
    return CreateProjectResponse.fromPartial({
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

  @Get("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingProjectsResponse))
  async findAllNew(@Body() data) {
    const request = GetPollingProjectsRequest.fromJSON(data);
    const projects = await this.projectsService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return projects.map((project) => project.toProto());
  }

  @Get("current")
  async findCurrent() {
    const project = await this.projectsService.getCurrentProject();
    return GetSingleProjectResponse.fromPartial({
      project: project.toProto(),
    });
  }

  @Get("current/objects")
  async findCurrentProjectObjects() {
    const [transactions, contracts] = await Promise.all([
      this.flowConfigService.getTransactionTemplates(),
      this.flowConfigService.getContractTemplates(),
    ]);
    return GetProjectObjectsResponse.fromPartial({
      transactions,
      contracts,
    });
  }

  @Get("/default")
  async default() {
    return GetSingleProjectResponse.fromPartial({
      project: await this.projectsService.getDefaultProject(),
    });
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
  async remove(@Param("id") id: string) {
    await this.projectsService.remove(id);
  }

  @ApiParam({ name: "id", type: String })
  @Post("/use/:id")
  async useProject(@Param("id") id: string) {
    const project = await this.projectsService.useProject(id);
    return UseProjectResponse.fromPartial({
      project: project.toProto(),
    });
  }
}
