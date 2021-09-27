import React, { FunctionComponent } from 'react';
import classes from './Start.module.scss';
import axios from 'axios';
import { useQuery } from 'react-query';

interface OwnProps {
    some: string;
}

type Props = OwnProps;

const Start: FunctionComponent<Props> = (props) => {
    const fetchData = (): Promise<any[]> => {
        return axios.get('/api/projects').then((response) => response.data);
    };

    const useProjects = () => {
        return useQuery('projects', fetchData);
    };

    const { data } = useProjects();

    return (
        <div className={classes.container}>
            <h1>Start</h1>
            {data && <p>Project name is: {data[0].name}</p>}
        </div>
    );
};

export default Start;
