import React, { FunctionComponent } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './NavigationItem.module.scss';

interface OwnProps {
    to: string;
    children: any;
    icon?: any;

    [key: string]: any;
}

type Props = OwnProps;

const NavigationItem: FunctionComponent<Props> = ({ to, children, icon }) => {
    return (
        <div className={classes.root}>
            <NavLink to={to} className={classes.navLink} activeClassName={classes.active}>
                <div>
                    {icon && <div className={classes.iconWrapper}> {icon}</div>}
                    <span>{children}</span>
                </div>
                <div>29</div>
            </NavLink>
        </div>
    );
};

export default NavigationItem;
