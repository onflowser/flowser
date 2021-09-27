import React, { FunctionComponent, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import classes from './Start.module.scss';
import { routes } from '../../shared/constants/routes';

interface OwnProps {
    some: string;
}

type Props = OwnProps;

const Start: FunctionComponent<Props> = (props) => {
    const history = useHistory();
    const onQuickstart = useCallback(() => {
        history.push(`/${routes.firstRouteAfterStart}`);
    }, []);

    return (
        <div className={classes.container}>
            <div className={classes.topContainer}>
                <header>
                    <h1>Flowser</h1>
                    <p className="tagline">Flowser is Flow Browser</p>
                </header>
            </div>
            <div className={classes.bottomContainer}>
                <h2>Create a new project</h2>
                <span>Quickstart for a one-click blockchain or create a new workspace for advanced setup options.</span>
                <div className={classes.buttonsContainer}>
                    <button onClick={onQuickstart}>Quickstart</button>
                    <button disabled={true}>New Project</button>
                </div>
            </div>
        </div>
    );
};

export default Start;
