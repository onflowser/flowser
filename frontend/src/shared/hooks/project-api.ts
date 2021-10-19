import axios from 'axios';

export const useProjectApi = () => {
    const getDefaultConfiguration = () => axios.get('/api/projects/default');
    const saveConfiguration = (configuration: any) => axios.post('/api/projects', configuration);
    const useProject = (id: string) => axios.post(`/api/projects/use/${id}`);

    return {
        getDefaultConfiguration,
        saveConfiguration,
        useProject,
    };
};
