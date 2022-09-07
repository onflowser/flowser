import React, { FunctionComponent, useCallback, useState } from "react";
import { routes } from "../../constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import Button from "../button/Button";
import { useNavigation } from "../../hooks/use-navigation";
import Breadcrumbs from "./Breadcrumbs";
import Search from "../search/Search";
import TransactionDialog from "../transaction-dialog/TransactionDialog";
import { useGetAllObjectsCounts } from "../../hooks/use-api";

import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import sideMenuOpen from "../../assets/icons/side-menu-open.svg";
import sideMenuClosed from "../../assets/icons/side-menu-closed.svg";
import sideMenuClosedEmuNoWork from "../../assets/icons/side-menu-closed-emulator-not-working.svg";
import sideMenuOpenEmuNoWork from "../../assets/icons/side-menu-open-emulator-not-working.svg";
import classNames from "classnames";
import { useProjectActions } from "../../contexts/project-actions.context";
import { useHistory } from "react-router-dom";

const Navigation: FunctionComponent<{
  className: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}> = (props) => {
  const { isShowBackButtonVisible, isNavigationDrawerVisible } =
    useNavigation();
  const history = useHistory();
  const { createSnapshot } = useProjectActions();
  const { data: counters } = useGetAllObjectsCounts();
  const [showTxDialog, setShowTxDialog] = useState(false);

  const isEmulatorWorking = true;
  const isSidebarOpen = props.isSidebarOpen;

  const onBack = useCallback(() => {
    history.goBack();
  }, []);

  return (
    <>
      <div className={classNames(classes.navigationContainer, props.className)}>
        <div className={classes.mainContainer}>
          <div className={classes.navLinksContainer}>
            <NavigationItem
              to={`/${routes.accounts}`}
              totalCounter={counters?.accounts}
            >
              ACCOUNTS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.blocks}`}
              totalCounter={counters?.blocks}
            >
              BLOCKS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.transactions}`}
              totalCounter={counters?.transactions}
            >
              TRANSACTIONS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.contracts}`}
              totalCounter={counters?.contracts}
            >
              CONTRACTS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.events}`}
              totalCounter={counters?.events}
            >
              EVENTS
            </NavigationItem>
            <NavigationItem
              to={`/${routes.project}`}
              activeClassName={classes.active}
              // counter={counters?.project} TODO(milestone-5): add project objects count
            >
              PROJECT
            </NavigationItem>
          </div>

          <div className={classes.rightContainer}>
            <Search className={classes.searchBox} responsive={true} />
            <Button className={classes.snapshotButton} onClick={createSnapshot}>
              SNAPSHOT
            </Button>
            <Button
              className={classes.sidebarButton}
              onClick={props.toggleSidebar}
            >
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
