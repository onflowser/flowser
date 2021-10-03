import React, { FunctionComponent, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { routes } from '../../shared/constants/routes';
import IconButton from '../../shared/components/icon-button/IconButton';
import Logo from '../../shared/assets/images/logo.svg';
import classes from './Start.module.scss';
import { ReactComponent as PlayIcon } from '../../shared/assets/icons/play.svg';
import { ReactComponent as PlusIcon } from '../../shared/assets/icons/plus.svg';

const Start: FunctionComponent<any> = () => {
    const history = useHistory();
    const onQuickstart = useCallback(() => {
        history.push(`/${routes.firstRouteAfterStart}`);
    }, []);

    return (
        <div className={classes.container}>
            <img src={Logo} alt="FLOWSER" />
            <h1>FLOWSER</h1>
            <IconButton onClick={onQuickstart} variant="big" icon={<PlayIcon />}>
                QUICK START
            </IconButton>

            <IconButton disabled={true} icon={<PlusIcon />} className={`${classes.newProjectBtn}`}>
                NEW PROJECT
            </IconButton>
        </div>
    );
};

export default Start;
