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
    const history = useHistory();
    const [error, setError] = useState('');
    const { useProject, projects, isLoadingProjects } = useProjectApi();
    const defaultProjects = projects.filter((p: any) => !p.isCustom);
    const customProjects = projects.filter((p: any) => p.isCustom);
    const getDefaultProject = (id: string) => defaultProjects.find((p: any) => p.id === id);

    const emulator = getDefaultProject('emulator');
    const testnet = getDefaultProject('testnet');
    const mainnet = getDefaultProject('mainnet');

    const onQuickstart = async (name: string) => {
        setError('');
        try {
            await useProject(name);
            history.push(`/${routes.firstRouteAfterStart}`);
        } catch (e: any) {
            setError(
                `Can not connect to "${name}". If you want to connect to your local host emulator make sure it is running. You can also start new emulator manually by clicking on "ADD CUSTOM EMULATOR" button`,
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
                    disabled={!emulator}
                >
                    EMULATOR
                </IconButton>
                <IconButton
                    onClick={() => onQuickstart('testnet')}
                    variant="big"
                    icon={<CaretIcon className={classes.caret} />}
                    iconPosition="after-end"
                    disabled={!testnet}
                >
                    TESTNET
                </IconButton>
                <IconButton
                    onClick={() => onQuickstart('mainnet')}
                    variant="big"
                    icon={<CaretIcon className={classes.caret} />}
                    iconPosition="after-end"
                    disabled={!mainnet}
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
                                {customProjects.map((project: any, index: number) => (
                                    <NavLink key={index} className={classes.link} to={`/start/configure/${project.id}`}>
                                        {project.name}
                                    </NavLink>
                                ))}
                                {customProjects.length === 0 && (
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
