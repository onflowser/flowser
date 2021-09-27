import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import styles from './Navigation.module.scss';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Navigation: FunctionComponent<Props> = (props) => {
    return (
        <div className={styles.navigationContainer}>
            <nav>
                <ul>
                    <li>
                        <Link to={'/start'} className="nav-link">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to={'/accounts'} className="nav-link">
                            Accounts
                        </Link>
                    </li>
                    <li>
                        <Link to={'/blocks'} className="nav-link">
                            Blocks
                        </Link>
                    </li>
                    <li>
                        <Link to={'/transactions'} className="nav-link">
                            Transactions
                        </Link>
                    </li>
                    <li>
                        <Link to={'/contracts'} className="nav-link">
                            Contracts
                        </Link>
                    </li>
                    <li>
                        <Link to={'/events'} className="nav-link">
                            Events
                        </Link>
                    </li>
                    <li>
                        <Link to={'/logs'} className="nav-link">
                            Logs
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Navigation;
