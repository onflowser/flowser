import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../shared/constants/routes';
import classes from './Navigation.module.scss';
import NavigationItem from './NavigationItem';
import Button from '../../../shared/components/button/Button';
import IconButton from '../../../shared/components/icon-button/IconButton';
import Logo from '../../../shared/assets/images/logo.svg';
import { ReactComponent as IconUser } from '../../../shared/assets/icons/user.svg';
import { ReactComponent as IconBlocks } from '../../../shared/assets/icons/blocks.svg';
import { ReactComponent as IconTransactions } from '../../../shared/assets/icons/transactions.svg';
import { ReactComponent as IconContracts } from '../../../shared/assets/icons/contracts.svg';
import { ReactComponent as IconEvents } from '../../../shared/assets/icons/events.svg';
import { ReactComponent as IconSettings } from '../../../shared/assets/icons/settings.svg';
import { ReactComponent as IconBackButton } from '../../../shared/assets/icons/back-button.svg';
import { ReactComponent as FlowLogo } from '../../../shared/assets/icons/flow.svg';
import { useNavigation } from '../../../shared/hooks/navigation';
import Breadcrumbs from './Breadcrumbs';
import Search from '../../../shared/components/search/Search';
import axios from '../../../shared/config/axios';
import { useProjectApi } from '../../../shared/hooks/project-api';
import { useFlow } from '../../../shared/hooks/flow';
import TransactionDialog from '../../../shared/components/transaction-dialog/TransactionDialog';

export interface Counters {
    accounts: number;
    blocks: number;
    transactions: number;
    contracts: number;
    events: number;
}

const Navigation = (props: any) => {
    const [isSwitching, setIsSwitching] = useState(false);
    const history = useHistory();
    const { isShowBackButtonVisible, isNavigationDrawerVisible, isSearchBarVisible } = useNavigation();
    const [counters, setCounters] = useState<Counters>();
    const [showTxDialog, setShowTxDialog] = useState<any>(false);
    const { currentProject } = useProjectApi();
    const { isLoggedIn, login, isLoggingIn, logout, isLoggingOut } = useFlow();

    const onSwitchProject = useCallback(async () => {
        setIsSwitching(true);
        try {
            await logout(); // logout from dev-wallet, because config may change
            await axios.delete('/api/projects/use'); // stop current emulator
            history.push(`/${routes.start}`);
        } finally {
            setIsSwitching(false);
        }
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            axios.get('/api/common/counters').then((response: any) => {
                setCounters(response.data);
            });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const onSettings = () => {
        history.push(`/start/configure/${currentProject?.id}`);
    };

    const onBack = useCallback(() => {
        history.goBack();
    }, []);

    return (
        <>
            <div className={`${classes.navigationContainer} ${props.className}`}>
                <div className={classes.mainContainer}>
                    <div className={classes.logoContainer}>
                        <img src={Logo} alt="FLOWSER" />
                    </div>
                    <div className={classes.navLinksContainer}>
                        <NavigationItem
                            to={`/${routes.accounts}`}
                            activeClassName={classes.active}
                            icon={<IconUser />}
                            counter={counters?.accounts}
                        >
                            ACCOUNTS
                        </NavigationItem>
                        <NavigationItem
                            to={`/${routes.blocks}`}
                            activeClassName={classes.active}
                            icon={<IconBlocks />}
                            counter={counters?.blocks}
                        >
                            BLOCKS
                        </NavigationItem>
                        <NavigationItem
                            to={`/${routes.transactions}`}
                            activeClassName={classes.active}
                            counter={counters?.transactions}
                            icon={<IconTransactions />}
                        >
                            TRANSACTIONS
                        </NavigationItem>
                        <NavigationItem
                            to={`/${routes.contracts}`}
                            activeClassName={classes.active}
                            counter={counters?.contracts}
                            icon={<IconContracts />}
                        >
                            CONTRACTS
                        </NavigationItem>
                        <NavigationItem
                            to={`/${routes.events}`}
                            activeClassName={classes.active}
                            icon={<IconEvents />}
                            counter={counters?.events}
                        >
                            EVENTS
                        </NavigationItem>
                    </div>

                    <div className={classes.rightContainer}>
                        <div>
                            <span>NETWORK</span>
                            <span>EMULATOR</span>
                        </div>
                        <div>
                            {isLoggedIn ? (
                                <IconButton
                                    className={classes.logoutButton}
                                    icon={<FlowLogo className={classes.flowIcon} />}
                                    iconPosition="before"
                                    onClick={logout}
                                    loading={isLoggingOut}
                                >
                                    LOG OUT
                                </IconButton>
                            ) : (
                                <IconButton
                                    className={classes.loginButton}
                                    icon={<FlowLogo className={classes.flowIcon} />}
                                    iconPosition="before"
                                    onClick={login}
                                    loading={isLoggingIn}
                                >
                                    LOG IN
                                </IconButton>
                            )}
                            {isLoggedIn && (
                                <Button className={classes.txButton} onClick={() => setShowTxDialog(true)}>
                                    SEND TRANSACTION
                                </Button>
                            )}
                        </div>
                        <div>
                            <Button loading={isSwitching} onClick={onSwitchProject}>
                                SWITCH
                            </Button>
                            <IconButton onClick={onSettings} icon={<IconSettings className={classes.settingsIcon} />} />
                        </div>
                    </div>
                </div>
                {/* NAVIGATION DRAWER */}
                {isNavigationDrawerVisible && (
                    <div className={classes.navigationDrawerContainer}>
                        {isShowBackButtonVisible && <IconBackButton onClick={onBack} className={classes.backButton} />}
                        <Breadcrumbs className={classes.breadcrumbs} />
                        {isSearchBarVisible && <Search className={classes.searchBar} />}
                    </div>
                )}
                <TransactionDialog show={showTxDialog} setShow={setShowTxDialog} />
            </div>
        </>
    );
};

export default Navigation;
