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
        return axios.get('/api').then((response) => response.data);
    };

    const useGroups = () => {
        return useQuery('groups', fetchData);
    };

    const { data } = useGroups();

    return (
        <div className={classes.container}>
            <h1>Start</h1>
            <p>Data from backend is {data}</p>
        </div>
    );
};

export default Start;
