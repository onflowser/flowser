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

export class ProjectsService {
  private static instance: ProjectsService | undefined;

  static getInstance(): ProjectsService {
    if (!ProjectsService.instance) {
      ProjectsService.instance = new ProjectsService();
    }
    return ProjectsService.instance;
  }

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

  getAll(): Promise<AxiosResponse<GetAllProjectsResponse>> {
    return axios.get("/api/projects", {
      transformResponse: (data) =>
        GetAllProjectsResponse.fromJSON(JSON.parse(data)),
    });
  }

  async useProject(id: string): Promise<UseProjectResponse> {
    const response = await axios.post(`/api/projects/use/${id}`);
    return UseProjectResponse.fromJSON(response.data);
  }

  async createProject(
    data: Exclude<Project, "id">
  ): Promise<CreateProjectResponse> {
    const response = await axios.post("/api/projects", Project.toJSON(data));
    return CreateProjectResponse.fromJSON(response.data);
  }

  async updateProject(data: Project): Promise<GetSingleProjectResponse> {
    const response = await axios.patch(
      `/api/projects/${data.id}`,
      Project.toJSON(data)
    );
    return GetSingleProjectResponse.fromJSON(response.data);
  }

  async unUseCurrentProject(): Promise<void> {
    await axios.delete(`/api/projects/use`);
  }

  async removeProject(id: string): Promise<void> {
    await axios.delete(`/api/projects/${id}`);
  }

  getCurrentProject(): Promise<AxiosResponse<GetSingleProjectResponse>> {
    return axios.get("/api/projects/current", {
      transformResponse: (data: string) =>
        GetSingleProjectResponse.fromJSON(JSON.parse(data)),
    });
  }

  getDefaultProjectInfo(): Promise<AxiosResponse<GetSingleProjectResponse>> {
    return axios.get("/api/projects/default", {
      transformResponse: (data: string) =>
        GetSingleProjectResponse.fromJSON(JSON.parse(data)),
    });
  }
}
