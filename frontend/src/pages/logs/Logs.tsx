import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import classes from './Logs.module.scss';
import Search from '../../shared/components/search/Search';
import { ReactComponent as ExpandIcon } from '../../shared/assets/icons/expand.svg';
import { ReactComponent as ShrinkIcon } from '../../shared/assets/icons/shrink.svg';
import { ReactComponent as LogsIcon } from '../../shared/assets/icons/logs.svg';
import { LogDrawerSize, useLogDrawer } from '../../shared/hooks/log-drawer';
import CaretIcon from '../../shared/components/caret-icon/CaretIcon';
import { useSyntaxHighlighter } from '../../shared/hooks/syntax-highlighter';
import { useTimeoutPolling } from '../../shared/hooks/timeout-polling';

interface OwnProps {
    className?: any;
}

type Props = OwnProps;

const Logs: FunctionComponent<Props> = ({ className }) => {
    const { logDrawerSize, setSize } = useLogDrawer();
    const { highlightLogKeywords } = useSyntaxHighlighter();
    const miniLogRef = useRef(null);
    const bigLogRef = useRef(null);
    const { data } = useTimeoutPolling('/api/logs/polling');
    const logs = data ? data.map((log: any) => log.data) : [];

    const scrollToBottom = (ref: any, smooth = true) => {
        if (ref.current) {
            const options = {
                top: ref.current.scrollHeight,
                left: 0,
                behavior: smooth ? 'smooth' : 'instant',
            };
            ref.current.scrollTo(options);
        }
    };

    useEffect(() => {
        scrollToBottom(miniLogRef);
        scrollToBottom(bigLogRef);
    }, [data]);

    const onCaretChange = useCallback((state) => {
        if (state === false) {
            changeLogDrawerSize('small');
        } else {
            changeLogDrawerSize('tiny');
        }
    }, []);

    const changeLogDrawerSize = useCallback((size: LogDrawerSize) => {
        setSize(size);
        setTimeout(() => {
            scrollToBottom(bigLogRef, false);
            scrollToBottom(miniLogRef, false);
        }, 100);
    }, []);

    return (
        <div className={`${classes.root} ${className}`}>
            <div className={`${classes.header} ${logDrawerSize !== 'tiny' ? classes.expanded : ''}`}>
                <span className={classes.leftContainer}>
                    <LogsIcon />
                    <span>LOGS</span>
                </span>

                {logDrawerSize === 'tiny' && (
                    <div className={classes.midContainer} ref={miniLogRef}>
                        {logs.map((log, key) => (
                            <pre key={key}>
                                <span dangerouslySetInnerHTML={{ __html: highlightLogKeywords(log) }}></span>
                            </pre>
                        ))}
                    </div>
                )}

                <div className={classes.rightContainer}>
                    {logDrawerSize !== 'tiny' && <Search className={classes.searchBox} />}
                    <div>
                        {(logDrawerSize === 'tiny' || logDrawerSize === 'small') && (
                            <CaretIcon
                                inverted={true}
                                isOpen={logDrawerSize !== 'tiny'}
                                className={classes.control}
                                onChange={onCaretChange}
                            />
                        )}
                        {logDrawerSize === 'small' && (
                            <ExpandIcon className={classes.control} onClick={() => changeLogDrawerSize('big')} />
                        )}
                        {logDrawerSize === 'big' && (
                            <ShrinkIcon className={classes.control} onClick={() => changeLogDrawerSize('small')} />
                        )}
                    </div>
                </div>
            </div>

            {logDrawerSize !== 'tiny' && (
                <div className={classes.bigLogsContainer} ref={bigLogRef}>
                    {logs.map((log, key) => (
                        <pre
                            className={classes.line}
                            key={key}
                            dangerouslySetInnerHTML={{ __html: highlightLogKeywords(log) }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Logs;
