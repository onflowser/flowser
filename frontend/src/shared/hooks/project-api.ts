import axios from "../config/axios";
import { useQuery } from "react-query";

export const useProjectApi = () => {
  const { data: projectsData, isLoading: isLoadingProjects } =
    useQuery<any>("/api/projects");
  const getDefaultConfiguration = () => axios.get("/api/projects/default");
  const saveConfiguration = (configuration: any) =>
    axios.post("/api/projects", configuration);
  const updateConfiguration = (id: string, configuration: any) =>
    axios.patch(`/api/projects/${id}`, configuration);
  const useProject = (id: string) => axios.post(`/api/projects/use/${id}`);
  const getProjectDetails = (id: string) => axios.get(`/api/projects/${id}`);
  const deleteProject = (id: string) => axios.delete(`/api/projects/${id}`);
  const { data: currentProjectData } = useQuery<any>("/api/projects/current");

  return {
    saveConfiguration,
    updateConfiguration,
    useProject,
    getProjectDetails,
    deleteProject,
    getDefaultConfiguration,
    projects: projectsData?.data || [],
    isLoadingProjects,
    currentProject: currentProjectData?.data || null,
  };
};
