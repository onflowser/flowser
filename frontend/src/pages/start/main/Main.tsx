import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { routes } from '../../../shared/constants/routes';
import IconButton from '../../../shared/components/icon-button/IconButton';
import Logo from '../../../shared/assets/images/logo.svg';
import classes from './Main.module.scss';
import { ReactComponent as CaretIcon } from '../../../shared/assets/icons/caret.svg';
import { ReactComponent as PlusIcon } from '../../../shared/assets/icons/plus.svg';
import { useProjectApi } from '../../../shared/hooks/project-api';

const Main: FunctionComponent<any> = () => {
    const [error, setError] = useState('');
    const { useProject, projects, isLoadingProjects } = useProjectApi();
    const history = useHistory();

    const onQuickstart = async (name: string) => {
        setError('');
        try {
            await useProject(name);
            history.push(`/${routes.firstRouteAfterStart}`);
        } catch (e) {
            setError(
                'Can not use emulator. Make sure emulator is running on your local machine! You can also start emulator manually by clicking on "ADD CUSTOM EMULATOR" button',
            );
            return false;
        }
    };

    const onConfigure = useCallback(() => {
        history.push(`/${routes.start}/configure`);
    }, []);

    return (
        <>
            {error && <div className={classes.errors}>{error}</div>}
            <div className={classes.container}>
                <img src={Logo} alt="FLOWSER" />
                <h1>FLOWSER</h1>
                <IconButton
                    onClick={() => onQuickstart('emulator')}
                    variant="big"
                    icon={<CaretIcon className={classes.caret} />}
                    iconPosition="after-end"
                >
                    EMULATOR
                </IconButton>
                <IconButton
                    onClick={() => onQuickstart('testnet')}
                    variant="big"
                    icon={<CaretIcon className={classes.caret} />}
                    iconPosition="after-end"
                >
                    TESTNET
                </IconButton>
                <IconButton
                    onClick={() => onQuickstart('mainnet')}
                    variant="big"
                    icon={<CaretIcon className={classes.caret} />}
                    iconPosition="after-end"
                >
                    MAINNET
                </IconButton>

                <IconButton
                    variant="big"
                    outlined={true}
                    onClick={onConfigure}
                    icon={<PlusIcon />}
                    iconPosition="after-end"
                    className={`${classes.newProjectBtn}`}
                >
                    ADD CUSTOM EMULATOR
                </IconButton>

                <div className={classes.projectsWrapper}>
                    <div className={classes.projects}>
                        <h2>YOUR CUSTOM EMULATORS</h2>
                        {isLoadingProjects ? (
                            <div className={classes.loading}>loading your custom emulators ...</div>
                        ) : (
                            <>
                                {projects.map((project: any, index: number) => (
                                    <NavLink key={index} className={classes.link} to={`/start/configure/${project.id}`}>
                                        {project.name}
                                    </NavLink>
                                ))}
                                {projects.length === 0 && (
                                    <span className={classes.noEmulators}>No custom emulators added yet</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Main;
