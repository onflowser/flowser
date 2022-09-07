import React, { FunctionComponent, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { routes } from "../../constants/routes";
import classes from "./Navigation.module.scss";
import NavigationItem from "./NavigationItem";
import logo from "../../assets/images/logo.svg";
import { ReactComponent as IconUser } from "../../assets/icons/user.svg";
import { ReactComponent as IconBlocks } from "../../assets/icons/blocks.svg";
import { ReactComponent as IconTransactions } from "../../assets/icons/transactions.svg";
import { ReactComponent as IconContracts } from "../../assets/icons/contracts.svg";
import { ReactComponent as IconEvents } from "../../assets/icons/events.svg";
import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import { useNavigation } from "../../hooks/use-navigation";
import Breadcrumbs from "./Breadcrumbs";
import Search from "../search/Search";
import TransactionDialog from "../transaction-dialog/TransactionDialog";
import Button from "../button/Button";
import { useProjectActions } from "../../contexts/project-actions.context";
import { useGetAllObjectsCounts } from "../../hooks/use-api";

const Navigation: FunctionComponent<{
  className: string;
  toggleSidebar: () => void;
}> = (props) => {
  const history = useHistory();
  const { createSnapshot } = useProjectActions();
  const {
    isShowBackButtonVisible,
    isNavigationDrawerVisible,
    isSearchBarVisible,
  } = useNavigation();
  const { data: counters } = useGetAllObjectsCounts();
  const [showTxDialog, setShowTxDialog] = useState(false);
  const onBack = useCallback(() => {
    history.goBack();
  }, []);

  return (
    <>
      <div className={`${classes.navigationContainer} ${props.className}`}>
        <div className={classes.mainContainer}>
          <div className={classes.logoContainer}>
            <img src={logo} alt="FLOWSER" />
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
              <Button className={classes.loginButton} onClick={createSnapshot}>
                SNAPSHOT
              </Button>
            </div>
            <Button
              className={classes.loginButton}
              onClick={props.toggleSidebar}
            >
              SIDEBAR
            </Button>
          </div>
        </div>
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
