import {
  CreateProjectResponse,
  Project,
  UseProjectResponse,
} from "@flowser/shared";
import {
  GetSingleProjectResponse,
  GetPollingProjectsResponse,
  GetAllProjectsResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class ProjectsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingProjectsResponse>> {
    return axios.get("/api/projects/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingProjectsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getSingle(id: string): Promise<AxiosResponse<GetSingleProjectResponse>> {
    return axios.get(`/api/projects/${id}`, {
      transformResponse: (data) =>
        GetSingleProjectResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAll(): Promise<GetAllProjectsResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/projects",
      responseProtobuf: GetAllProjectsResponse,
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

  updateProject(data: Project): Promise<GetSingleProjectResponse> {
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
