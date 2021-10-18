import React, { useCallback } from 'react';
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
import { useNavigation } from '../../../shared/hooks/navigation';
import Breadcrumbs from './Breadcrumbs';
import Search from '../../../shared/components/search/Search';

const Navigation = (props: any) => {
    const history = useHistory();
    const { isShowBackButtonVisible, isNavigationDrawerVisible, isSearchBarVisible } = useNavigation();

    const onSwitchProject = useCallback(() => {
        history.push(`/${routes.start}`);
    }, []);

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
                        <NavigationItem to={`/${routes.accounts}`} activeClassName={classes.active} icon={<IconUser />}>
                            ACCOUNTS
                        </NavigationItem>
                        <NavigationItem to={`/${routes.blocks}`} activeClassName={classes.active} icon={<IconBlocks />}>
                            BLOCKS
                        </NavigationItem>
                        <NavigationItem
                            to={`/${routes.transactions}`}
                            activeClassName={classes.active}
                            icon={<IconTransactions />}
                        >
                            TRANSACTIONS
                        </NavigationItem>
                        <NavigationItem
                            to={`/${routes.contracts}`}
                            activeClassName={classes.active}
                            icon={<IconContracts />}
                        >
                            CONTRACTS
                        </NavigationItem>
                        <NavigationItem to={`/${routes.events}`} activeClassName={classes.active} icon={<IconEvents />}>
                            EVENTS
                        </NavigationItem>
                    </div>

                    <div className={classes.rightContainer}>
                        <div>
                            <span>NETWORK</span>
                            <span>EMULATOR</span>
                        </div>
                        <div>
                            {/*<Button disabled={true}>SAVE</Button>*/}
                            <Button onClick={onSwitchProject}>SWITCH</Button>
                            <IconButton disabled={true} icon={<IconSettings className={classes.settingsIcon} />} />
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
            </div>
        </>
    );
};

export default Navigation;
