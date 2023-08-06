import React, { FunctionComponent } from "react";
import classes from "./TopRow.module.scss";
import Button from "../buttons/button/Button";
import Search from "../search/Search";
import sideMenuOpen from "../../assets/icons/side-menu-open.svg";
import sideMenuClosed from "../../assets/icons/side-menu-closed.svg";
import sideMenuClosedEmuNoWork from "../../assets/icons/side-menu-closed-emulator-not-working.svg";
import sideMenuOpenEmuNoWork from "../../assets/icons/side-menu-open-emulator-not-working.svg";
import classNames from "classnames";
import { useHistory } from "react-router-dom";
import { LoggedInAccountAvatar } from "../account/avatar/AccountAvatar";
import { useFlow } from "../../hooks/use-flow";
import { SimpleButton } from "../buttons/simple-button/SimpleButton";

export const TopRow: FunctionComponent<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}> = (props) => {
  const { user, isLoggedIn } = useFlow();
  const history = useHistory();

  const isEmulatorWorking = true;
  const isSidebarOpen = props.isSidebarOpen;

  return (
    <div className={classes.root}>
      <div className={classes.rightContainer}>
        <Search className={classes.searchBox} />
        {isLoggedIn && (
          <SimpleButton
            className={classes.userButton}
            onClick={() => history.push(`/accounts/details/${user?.addr}`)}
          >
            <LoggedInAccountAvatar />
          </SimpleButton>
        )}
        <Button className={classes.sidebarButton} onClick={props.toggleSidebar}>
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
  );
};
