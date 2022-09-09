import {
  CreateProjectResponse,
  GetPollingProjectsRequest,
  GetProjectObjectsResponse,
  Project,
  UpdateProjectResponse,
  UseProjectResponse,
} from "@flowser/shared";
import {
  GetSingleProjectResponse,
  GetPollingProjectsResponse,
  GetAllProjectsResponse,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class ProjectsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingProjectsResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/projects/polling`,
      requestData: data,
      requestProtobuf: GetPollingProjectsRequest,
      responseProtobuf: GetPollingProjectsResponse,
    });
  }

  getSingle(id: string): Promise<GetSingleProjectResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/projects/${id}`,
      responseProtobuf: GetSingleProjectResponse,
    });
  }

  getAll(): Promise<GetAllProjectsResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/projects",
      responseProtobuf: GetAllProjectsResponse,
    });
  }

  getAllProjectObjects(): Promise<GetProjectObjectsResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/flow/objects",
      responseProtobuf: GetProjectObjectsResponse,
    });
  }

  useProject(id: string): Promise<UseProjectResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/projects/use/${id}`,
    });
  }

  createProject(data: Exclude<Project, "id">): Promise<CreateProjectResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/projects",
      requestData: data,
      requestProtobuf: Project,
      responseProtobuf: CreateProjectResponse,
    });
  }

  updateProject(data: Project): Promise<UpdateProjectResponse> {
    return this.transport.send({
      requestMethod: "PATCH",
      resourceIdentifier: `/api/projects/${data.id}`,
      requestData: data,
      requestProtobuf: Project,
      responseProtobuf: GetSingleProjectResponse,
    });
  }

  unUseCurrentProject(): Promise<void> {
    return this.transport.send({
      requestMethod: "DELETE",
      resourceIdentifier: "/api/projects/use",
    });
  }

  removeProject(id: string): Promise<void> {
    return this.transport.send({
      requestMethod: "DELETE",
      resourceIdentifier: `/api/projects/${id}`,
    });
  }

  getCurrentProject(): Promise<GetSingleProjectResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/projects/current`,
      responseProtobuf: GetSingleProjectResponse,
    });
  }

  getDefaultProjectInfo(): Promise<GetSingleProjectResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/projects/default`,
      responseProtobuf: GetSingleProjectResponse,
    });
  }
}
