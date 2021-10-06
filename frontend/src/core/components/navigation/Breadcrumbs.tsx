import React, { FunctionComponent } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigation } from '../../../shared/hooks/navigation';
import classes from './Breadcrumbs.module.scss';

const Breadcrumbs: FunctionComponent<any> = ({ className }) => {
    const { breadcrumbs } = useNavigation();

    if (breadcrumbs.length === 0) {
        return <></>;
    }

    return (
        <div className={`${classes.root} ${className}`}>
            {breadcrumbs
                .map<React.ReactNode>((item, key) => (
                    <NavLink key={key} to={item.to}>
                        {item.label}
                    </NavLink>
                ))
                .reduce((prev, curr, i) => [prev, <span key={++i}>{'>>'}</span>, curr])}
        </div>
    );
};

export default Breadcrumbs;
