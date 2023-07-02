import React, { FunctionComponent, useCallback } from "react";
import { routes } from "../../constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import Button from "../button/Button";
import { useNavigation } from "../../hooks/use-navigation";
import Breadcrumbs from "./Breadcrumbs";
import Search from "../search/Search";
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
import { SizedBox } from "../sized-box/SizedBox";

const Navigation: FunctionComponent<{
  className?: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}> = (props) => {
  const { isShowBackButtonVisible, isBreadcrumbsVisible } = useNavigation();
  const breadCrumbsBarHeight = 50;
  const navigationBarHeight = 65;
  const navigationHeight =
    (isBreadcrumbsVisible ? breadCrumbsBarHeight : 0) + navigationBarHeight;
  const { user, isLoggedIn } = useFlow();
  const history = useHistory();

  const isEmulatorWorking = true;
  const isSidebarOpen = props.isSidebarOpen;

  const onBack = useCallback(() => {
    history.goBack();
  }, []);

  return (
    <>
      <SizedBox height={navigationHeight} />
      <div className={classNames(classes.navigationContainer, props.className)}>
        <div className={classes.mainContainer}>
          <div className={classes.navLinksContainer}>
            <NavigationItem to={routes.accounts}>Accounts</NavigationItem>
            <NavigationItem to={routes.blocks}>Blocks</NavigationItem>
            <NavigationItem
              to={routes.transactions}
            >
              Transactions
            </NavigationItem>
            <NavigationItem
              to={routes.contracts}
            >
              Contracts
            </NavigationItem>
            <NavigationItem to={routes.events}>
              Events
            </NavigationItem>
            <NavigationItem to={routes.interactions}>
              Interactions
            </NavigationItem>
            <NavigationItem to={routes.project}>
              Project
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
        {isBreadcrumbsVisible && (
          <div className={classes.breadcrumbsContainer}>
            {isShowBackButtonVisible && (
              <div className={classes.backButtonWrapper} onClick={onBack}>
                <IconBackButton className={classes.backButton} />
              </div>
            )}
            <Breadcrumbs className={classes.breadcrumbs} />
          </div>
        )}
      </div>
    </>
  );
};

export default Navigation;
