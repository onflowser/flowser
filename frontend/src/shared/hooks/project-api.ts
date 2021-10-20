import axios from 'axios';

export const useProjectApi = () => {
    const getDefaultConfiguration = () => axios.get('/api/projects/default');
    const saveConfiguration = (configuration: any) => axios.post('/api/projects', configuration);
    const updateConfiguration = (id: string, configuration: any) => axios.patch(`/api/projects/${id}`, configuration);
    const useProject = (id: string) => axios.post(`/api/projects/use/${id}`);
    const getAllProjects = () => axios.get('/api/projects');
    const getProjectDetails = (id: string) => axios.get(`/api/projects/${id}`);
    const deleteProject = (id: string) => axios.delete(`/api/projects/${id}`);

    return {
        getDefaultConfiguration,
        saveConfiguration,
        updateConfiguration,
        useProject,
        getAllProjects,
        getProjectDetails,
        deleteProject,
    };
};
