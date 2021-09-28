import React from 'react';
import { NavLink } from 'react-router-dom';
import { routes } from '../../../shared/constants/routes';
import classes from './Navigation.module.scss';

const Navigation = () => {
    return (
        <div className={classes.navigationContainer}>
            <nav>
                <ul>
                    <li>
                        <NavLink to={`/${routes.start}`} className={classes.navLink} activeClassName={classes.active}>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={`/${routes.accounts}`}
                            className={classes.navLink}
                            activeClassName={classes.active}
                        >
                            Accounts
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/${routes.blocks}`} className={classes.navLink} activeClassName={classes.active}>
                            Blocks
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={`/${routes.transactions}`}
                            className={classes.navLink}
                            activeClassName={classes.active}
                        >
                            Transactions
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={`/${routes.contracts}`}
                            className={classes.navLink}
                            activeClassName={classes.active}
                        >
                            Contracts
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/${routes.events}`} className={classes.navLink} activeClassName={classes.active}>
                            Events
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/${routes.logs}`} className={classes.navLink} activeClassName={classes.active}>
                            Logs
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Navigation;
