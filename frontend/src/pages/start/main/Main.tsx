import React, { FunctionComponent, useCallback, useState } from 'react';
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
    const { useProject } = useProjectApi();
    const history = useHistory();

    const onQuickstart = async () => {
        setError('');
        try {
            await useProject('emulator');
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
                    onClick={onQuickstart}
                    variant="big"
                    icon={<CaretIcon className={classes.caret} />}
                    iconPosition="after-end"
                >
                    EMULATOR
                </IconButton>
                <IconButton
                    onClick={onQuickstart}
                    variant="big"
                    icon={<CaretIcon className={classes.caret} />}
                    iconPosition="after-end"
                >
                    TESTNET
                </IconButton>
                <IconButton
                    onClick={onQuickstart}
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

                <h2>YOUR CUSTOM EMULATORS</h2>
                <NavLink className={classes.link} to="/start/configure/11jh12g3j1h2g3j1h2">
                    Test 1
                </NavLink>
                <NavLink className={classes.link} to="/start/configure/11jh12g3j1h2g3j1h2">
                    Another Test
                </NavLink>
                <NavLink className={classes.link} to="/start/configure/11jh12g3j1h2g3j1h2">
                    Local Machine Emulator
                </NavLink>
            </div>
        </>
    );
};

export default Main;
