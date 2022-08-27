import React, { FunctionComponent, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { routes } from "../../constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import Button from "../button/Button";
import IconButton from "../icon-button/IconButton";
import Logo from "../../assets/images/logo.svg";
import IconUser from "../../assets/icons/user.svg";
import IconBlocks from "../../assets/icons/blocks.svg";
import IconTransactions from "../../assets/icons/transactions.svg";
import IconContracts from "../../assets/icons/contracts.svg";
import IconEvents from "../../assets/icons/events.svg";
import IconSettings from "../../assets/icons/settings.svg";
import IconBackButton from "../../assets/icons/back-button.svg";
import FlowLogo from "../../assets/icons/flow.svg";
import { useNavigation } from "../../hooks/use-navigation";
import Breadcrumbs from "./Breadcrumbs";
import Search from "../search/Search";
import { useFlow } from "../../hooks/use-flow";
import TransactionDialog from "../transaction-dialog/TransactionDialog";
import {
  useGetAllObjectsCounts,
  useGetCurrentProject,
} from "../../hooks/use-api";
import { ProjectsService } from "../../services/projects.service";

const Navigation: FunctionComponent<{ className: string }> = (props) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const history = useHistory();
  const {
    isShowBackButtonVisible,
    isNavigationDrawerVisible,
    isSearchBarVisible,
  } = useNavigation();
  const projectService = ProjectsService.getInstance();
  const { data: counters } = useGetAllObjectsCounts();
  const [showTxDialog, setShowTxDialog] = useState(false);
  const { data } = useGetCurrentProject();
  const { project: currentProject } = data ?? {};
  const { isLoggedIn, login, isLoggingIn, logout, isLoggingOut } = useFlow();

  const onSwitchProject = useCallback(async () => {
    setIsSwitching(true);
    try {
      await projectService.unUseCurrentProject();
    } catch (e) {
      // nothing critical happened, ignore the error
      console.warn("Couldn't stop the emulator: ", e);
    }
    history.replace(`/${routes.start}`);
    try {
      await logout(); // logout from dev-wallet, because config may change
    } finally {
      setIsSwitching(false);
    }
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
            <Logo className={classes.logo} />
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
                <Button
                  className={classes.txButton}
                  onClick={() => setShowTxDialog(true)}
                >
                  SEND TRANSACTION
                </Button>
              )}
            </div>
            <div>
              <Button loading={isSwitching} onClick={onSwitchProject}>
                SWITCH
              </Button>
              <IconButton
                onClick={onSettings}
                icon={<IconSettings className={classes.settingsIcon} />}
              />
            </div>
          </div>
        </div>
        {/* NAVIGATION DRAWER */}
        {isNavigationDrawerVisible && (
          <div className={classes.navigationDrawerContainer}>
            {isShowBackButtonVisible && (
              <IconBackButton onClick={onBack} className={classes.backButton} />
            )}
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
