import React, { FunctionComponent, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { routes } from "../../../shared/constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import Button from "../../../shared/components/button/Button";
import IconButton from "../../../shared/components/icon-button/IconButton";
import Logo from "../../../shared/assets/images/logo.svg";
import { ReactComponent as IconUser } from "../../../shared/assets/icons/user.svg";
import { ReactComponent as IconBlocks } from "../../../shared/assets/icons/blocks.svg";
import { ReactComponent as IconTransactions } from "../../../shared/assets/icons/transactions.svg";
import { ReactComponent as IconContracts } from "../../../shared/assets/icons/contracts.svg";
import { ReactComponent as IconEvents } from "../../../shared/assets/icons/events.svg";
import { ReactComponent as IconSettings } from "../../../shared/assets/icons/settings.svg";
import { ReactComponent as IconBackButton } from "../../../shared/assets/icons/back-button.svg";
import { ReactComponent as FlowLogo } from "../../../shared/assets/icons/flow.svg";
import { useNavigation } from "../../../shared/hooks/navigation";
import Breadcrumbs from "./Breadcrumbs";
import Search from "../../../shared/components/search/Search";
import { useFlow } from "../../../shared/hooks/flow";
import TransactionDialog from "../../../shared/components/transaction-dialog/TransactionDialog";
import toast from "react-hot-toast";
import {
  useGetAllObjectsCounts,
  useGetCurrentProject,
} from "../../../shared/hooks/api";
import { ProjectsService } from "../../../shared/services/projects.service";

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
  const isEmulatorProject = !!currentProject?.emulator;
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
                  onClick={() => {
                    if (isEmulatorProject) {
                      login();
                    } else {
                      toast.error(
                        () => (
                          <span style={{ textAlign: "center" }}>
                            fcl-dev-wallet integration is currently supported
                            only for custom projects.
                            <br />
                            See{" "}
                            <a href="https://github.com/onflowser/flowser#-caveats">
                              https://github.com/onflowser/flowser#-caveats
                            </a>
                          </span>
                        ),
                        { duration: 5000 }
                      );
                    }
                  }}
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
