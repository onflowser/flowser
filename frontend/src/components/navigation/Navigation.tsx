import React, { FunctionComponent, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { routes } from "../../constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import Button from "../button/Button";
import { useNavigation } from "../../hooks/use-navigation";
import { toast } from "react-hot-toast";
import Breadcrumbs from "./Breadcrumbs";
import Search from "../search/Search";
import { useFlow } from "../../hooks/use-flow";
import TransactionDialog from "../transaction-dialog/TransactionDialog";
import {
  useGetAllObjectsCounts,
  useGetCurrentProject,
} from "../../hooks/use-api";
import { ServiceRegistry } from "../../services/service-registry";
import { CommonUtils } from "../../utils/common-utils";
import { useErrorHandler } from "../../hooks/use-error-handler";

import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import sideMenuOpen from "../../assets/icons/side-menu-open.svg";
import sideMenuClosed from "../../assets/icons/side-menu-closed.svg";
import sideMenuClosedEmuNoWork from "../../assets/icons/side-menu-closed-emulator-not-working.svg";
import sideMenuOpenEmuNoWork from "../../assets/icons/side-menu-open-emulator-not-working.svg";
import classNames from "classnames";

const Navigation: FunctionComponent<{ className: string }> = (props) => {
  const { handleError } = useErrorHandler(Navigation.name);
  const [isSwitching, setIsSwitching] = useState(false);
  const history = useHistory();
  const { isShowBackButtonVisible, isNavigationDrawerVisible } =
    useNavigation();
  const { projectsService, snapshotService } = ServiceRegistry.getInstance();
  const { data: counters } = useGetAllObjectsCounts();
  const [showTxDialog, setShowTxDialog] = useState(false);
  const { data } = useGetCurrentProject();
  const { project: currentProject } = data ?? {};
  const { isLoggedIn, login, isLoggingIn, logout, isLoggingOut } = useFlow();

  const isEmulatorWorking = true;
  const isSidebarOpen = false;

  const onSwitchProject = useCallback(async () => {
    setIsSwitching(true);
    try {
      await projectsService.unUseCurrentProject();
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

  const createSnapshot = useCallback(async () => {
    try {
      // TODO(milestone-5): provide a way to input a custom description
      await snapshotService.create({
        description: "Test",
      });
      toast.success("Snapshot created");
    } catch (e) {
      handleError(e);
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
          <div className={classes.navLinksContainer}>
            <NavigationItem
              to={`/${routes.accounts}`}
              activeClassName={classes.active}
              totalCounter={counters?.accounts}
            >
              ACCOUNTS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.blocks}`}
              activeClassName={classes.active}
              totalCounter={counters?.blocks}
            >
              BLOCKS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.transactions}`}
              activeClassName={classes.active}
              totalCounter={counters?.transactions}
            >
              TRANSACTIONS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.contracts}`}
              activeClassName={classes.active}
              totalCounter={counters?.contracts}
            >
              CONTRACTS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.events}`}
              activeClassName={classes.active}
              totalCounter={counters?.events}
            >
              EVENTS
            </NavigationItem>
          </div>

          <div className={classes.rightContainer}>
            <Search className={classes.searchBox} responsive={true} />
            <Button className={classes.snapshotButton} onClick={createSnapshot}>
              SNAPSHOT
            </Button>
            <Button className={classes.sidebarButton}>
              <img
                src={
                  isEmulatorWorking
                    ? isSidebarOpen
                      ? sideMenuOpen
                      : sideMenuClosed
                    : isSidebarOpen
                    ? sideMenuOpenEmuNoWork
                    : sideMenuClosedEmuNoWork
                }
                className={classNames({
                  [classes.sidebarOpen]: isSidebarOpen,
                  [classes.emulatorWorking]: isEmulatorWorking,
                })}
                alt="sidebar toggle button"
              />
            </Button>
          </div>
        </div>
        {/* NAVIGATION DRAWER */}
        {isNavigationDrawerVisible && (
          <div className={classes.navigationDrawerContainer}>
            {isShowBackButtonVisible && (
              <div className={classes.backButtonWrapper} onClick={onBack}>
                <IconBackButton className={classes.backButton} />
              </div>
            )}
            <Breadcrumbs className={classes.breadcrumbs} />
          </div>
        )}
        <TransactionDialog show={showTxDialog} setShow={setShowTxDialog} />
      </div>
    </>
  );
};

export default Navigation;
