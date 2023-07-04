import React, { FunctionComponent } from "react";
import { routes } from "../../constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import Button from "../button/Button";
import Search from "../search/Search";
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
  const navigationHeight = 80;
  const { user, isLoggedIn } = useFlow();
  const history = useHistory();

  const isEmulatorWorking = true;
  const isSidebarOpen = props.isSidebarOpen;

  return (
    <>
      <SizedBox height={navigationHeight} />
      <div className={classNames(classes.navigationContainer, props.className)}>
        <div className={classes.mainContainer}>
          <div className={classes.navLinksContainer}>
            <NavigationItem to={routes.accounts}>Accounts</NavigationItem>
            <NavigationItem to={routes.blocks}>Blocks</NavigationItem>
            <NavigationItem to={routes.transactions}>
              Transactions
            </NavigationItem>
            <NavigationItem to={routes.contracts}>Contracts</NavigationItem>
            <NavigationItem to={routes.events}>Events</NavigationItem>
            <NavigationItem to={routes.project}>Project</NavigationItem>
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
      </div>
    </>
  );
};

export default Navigation;
