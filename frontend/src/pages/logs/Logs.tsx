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
    const { size, setSize } = useLogDrawer();

    return (
        <div className={`${classes.root} ${className}`}>
            <div className={classes.header}>
                <span>
                    <LogsIcon />
                    <span>LOGS</span>
                </span>
                <div>
                    {size !== 'tiny' && <Search />}
                    <div>
                        {size === 'tiny' && <OpenIcon className={classes.control} onClick={() => setSize('small')} />}
                        {size === 'small' && <CloseIcon className={classes.control} onClick={() => setSize('tiny')} />}
                        {size === 'small' && <ExpandIcon className={classes.control} onClick={() => setSize('big')} />}
                        {size === 'big' && <ShrinkIcon className={classes.control} onClick={() => setSize('small')} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logs;
