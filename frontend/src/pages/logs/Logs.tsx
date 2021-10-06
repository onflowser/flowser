import React, { FunctionComponent } from 'react';
import classes from './Logs.module.scss';
import Search from '../../shared/components/search/Search';
import { ReactComponent as OpenIcon } from '../../shared/assets/icons/open-logs.svg';
import { ReactComponent as CloseIcon } from '../../shared/assets/icons/close-logs.svg';
import { ReactComponent as ExpandIcon } from '../../shared/assets/icons/expand.svg';
import { ReactComponent as ShrinkIcon } from '../../shared/assets/icons/shrink.svg';
import { ReactComponent as LogsIcon } from '../../shared/assets/icons/logs.svg';
import { useLogDrawer } from '../../shared/hooks/log-drawer';

interface OwnProps {
    className?: any;
}

type Props = OwnProps;

const Logs: FunctionComponent<Props> = ({ className }) => {
    const { logDrawerSize, setSize } = useLogDrawer();

    return (
        <div className={`${classes.root} ${className}`}>
            <div className={classes.header}>
                <span>
                    <LogsIcon />
                    <span>LOGS</span>
                </span>
                <div>
                    {logDrawerSize !== 'tiny' && <Search className={classes.searchBox} />}
                    <div>
                        {logDrawerSize === 'tiny' && (
                            <OpenIcon className={classes.control} onClick={() => setSize('small')} />
                        )}
                        {logDrawerSize === 'small' && (
                            <ExpandIcon className={classes.control} onClick={() => setSize('big')} />
                        )}
                        {logDrawerSize === 'small' && (
                            <CloseIcon className={classes.control} onClick={() => setSize('tiny')} />
                        )}
                        {logDrawerSize === 'big' && (
                            <ShrinkIcon className={classes.control} onClick={() => setSize('small')} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logs;
