import React, { FunctionComponent, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { routes } from '../../shared/constants/routes';
import Button from '../../shared/components/button/Button';
import Logo from '../../shared/assets/images/logo.svg';
import classes from './Start.module.scss';

const Start: FunctionComponent<any> = () => {
    const history = useHistory();
    const onQuickstart = useCallback(() => {
        history.push(`/${routes.firstRouteAfterStart}`);
    }, []);

    return (
        <div className={classes.container}>
            <img src={Logo} alt="FLOWSER" />
            <h1>FLOWSER</h1>

            <Button onClick={onQuickstart} variant="big">
                QUICK START
            </Button>
            <Button disabled={true}>NEW PROJECT</Button>
        </div>
    );
};

export default Start;
