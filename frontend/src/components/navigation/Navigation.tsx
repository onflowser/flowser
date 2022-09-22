import React, { FunctionComponent, useCallback } from "react";
import { routes } from "../../constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import Button from "../button/Button";
import { useNavigation } from "../../hooks/use-navigation";
import Breadcrumbs from "./Breadcrumbs";
import Search from "../search/Search";
import { useTabCount } from "../../hooks/use-tab-count";

import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import sideMenuOpen from "../../assets/icons/side-menu-open.svg";
import sideMenuClosed from "../../assets/icons/side-menu-closed.svg";
import sideMenuClosedEmuNoWork from "../../assets/icons/side-menu-closed-emulator-not-working.svg";
import sideMenuOpenEmuNoWork from "../../assets/icons/side-menu-open-emulator-not-working.svg";
import classNames from "classnames";
import { useHistory } from "react-router-dom";
import { UserIcon } from "../user-icon/UserIcon";
import { useFlow } from "../../hooks/use-flow";
import { SimpleButton } from "../simple-button/SimpleButton";

const Navigation: FunctionComponent<{
  className: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}> = (props) => {
  const { isShowBackButtonVisible, isNavigationDrawerVisible } =
    useNavigation();
  const { user, isLoggedIn } = useFlow();
  const history = useHistory();
  const tabCount = useTabCount();

  const isEmulatorWorking = true;
  const isSidebarOpen = props.isSidebarOpen;

  const onBack = useCallback(() => {
    history.goBack();
  }, []);

  return (
    <div className={classNames(classes.navigationContainer, props.className)}>
      <div className={classes.mainContainer}>
        <div className={classes.navLinksContainer}>
          <NavigationItem
            to={`/${routes.accounts}`}
            totalCounter={tabCount.accounts}
          >
            ACCOUNTS
          </NavigationItem>
          <NavigationItem
            to={`/${routes.blocks}`}
            totalCounter={tabCount.blocks}
          >
            BLOCKS
          </NavigationItem>
          <NavigationItem
            to={`/${routes.transactions}`}
            totalCounter={tabCount.transactions}
          >
            TRANSACTIONS
          </NavigationItem>
          <NavigationItem
            to={`/${routes.contracts}`}
            totalCounter={tabCount.contracts}
          >
            CONTRACTS
          </NavigationItem>
          <NavigationItem
            to={`/${routes.events}`}
            totalCounter={tabCount.events}
          >
            EVENTS
          </NavigationItem>
          <NavigationItem
            to={`/${routes.project}`}
            totalCounter={tabCount.project}
          >
            PROJECT
          </NavigationItem>
        </div>

        <div className={classes.rightContainer}>
          <Search className={classes.searchBox} responsive={true} />
          {isLoggedIn && (
            <SimpleButton
              className={classes.userButton}
              onClick={() => history.push(`/accounts/details/${user?.addr}`)}
            >
              <UserIcon />
            </SimpleButton>
          )}
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
    </div>
  );
};

export default Navigation;
