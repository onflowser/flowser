import { Project } from "@flowser/types/generated/entities/projects";
import {
  GetSingleProjectResponse,
  GetPollingProjectsResponse,
  GetAllProjectsResponse,
} from "@flowser/types/generated/responses/projects";
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

  useProject(id: string): Promise<AxiosResponse<GetSingleProjectResponse>> {
    return axios.post(`/api/projects/use/${id}`, {
      transformResponse: (data: string) =>
        GetSingleProjectResponse.fromJSON(JSON.parse(data)),
    });
  }

  createProject(
    data: Exclude<Project, "id">
  ): Promise<AxiosResponse<GetSingleProjectResponse>> {
    return axios.post("/api/projects", Project.toJSON(data), {
      transformResponse: (data: string) =>
        GetSingleProjectResponse.fromJSON(JSON.parse(data)),
    });
  }

  updateProject(
    data: Project
  ): Promise<AxiosResponse<GetSingleProjectResponse>> {
    return axios.patch(`/api/projects/${data.id}`, Project.toJSON(data), {
      transformResponse: (data: string) =>
        GetSingleProjectResponse.fromJSON(JSON.parse(data)),
    });
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
