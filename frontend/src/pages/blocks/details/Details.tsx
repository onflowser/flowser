import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useSearch } from '../../../shared/hooks/search';
import { Breadcrumb, useNavigation } from '../../../shared/hooks/navigation';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import CopyButton from '../../../shared/components/copy-button/CopyButton';
import Card from '../../../shared/components/card/Card';
import TimeAgo from '../../../shared/components/time-ago/TimeAgo';
import DateWithCalendar from '../../../shared/components/date-with-calendar/DateWithCalendar';
import classes from './Details.module.scss';
import { DetailsTabItem, DetailsTabs } from '../../../shared/components/details-tabs/DetailsTabs';
import { useDetailsQuery } from '../../../shared/hooks/details-query';
import { useTimeoutPolling } from '../../../shared/hooks/timeout-polling';
import FullScreenLoading from '../../../shared/components/fullscreen-loading/FullScreenLoading';
import { isInitialParentId } from '../../../shared/functions/utils';

enum ContentDetails {
    HEIGHT = 'height',
    TRANSACTIONS = 'transactions',
    COLLECTIONS = 'collections',
}

type RouteParams = {
    blockId: string;
};

const Details: FunctionComponent<any> = () => {
    const { blockId } = useParams<RouteParams>();
    const { setPlaceholder } = useSearch();
    const { setBreadcrumbs, showSearchBar } = useNavigation();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const [contentDetails, setContentDetails] = useState(ContentDetails.HEIGHT);

    const breadcrumbs: Breadcrumb[] = [{ to: '/blocks', label: 'Blocks' }, { label: 'Details' }];

    const { isLoading, data } = useDetailsQuery(`/api/blocks/${blockId}`);
    const { data: transactions } = useTimeoutPolling(`/api/blocks/${blockId}/transactions/polling`);
    const date = data && new Date(data.timestamp).toISOString();

    useEffect(() => {
        showNavigationDrawer(true);
        showSubNavigation(false);
        setBreadcrumbs(breadcrumbs);
        showSearchBar(false);
    }, []);

    useEffect(() => {
        showSearchBar(contentDetails !== ContentDetails.HEIGHT);
        switch (contentDetails) {
            case ContentDetails.TRANSACTIONS:
                setPlaceholder('search for transactions');
                break;
            case ContentDetails.COLLECTIONS:
                setPlaceholder('search for collections');
                break;
        }
    }, [contentDetails]);

    if (isLoading || !data) {
        return <FullScreenLoading />;
    }

    return (
        <div className={classes.root}>
            <div className={classes.firstRow}>
                <Label variant="large">BLOCK ID</Label>
                <Value variant="large">{data.id}</Value>
                <CopyButton value={data.id} />
            </div>
            <Card className={classes.bigCard}>
                <div>
                    <Label variant="large" className={classes.label}>
                        PARENT ID
                    </Label>
                    <Value variant="large">
                        {isInitialParentId(data.parentId) ? (
                            data.parentId
                        ) : (
                            <NavLink to={`/blocks/details/${data.parentId}`}>{data.parentId}</NavLink>
                        )}
                    </Value>
                </div>
                <div className={classes.dateAndTimeAgo}>
                    <TimeAgo date={date} />
                    <DateWithCalendar date={date} />
                </div>
            </Card>

            <DetailsTabs>
                <DetailsTabItem label="HEIGHT" value="1" />
                <DetailsTabItem
                    label="TRANSACTIONS"
                    value={transactions.length}
                    onClick={() => setPlaceholder('search for transactions')}
                >
                    {transactions &&
                        transactions.map((transaction: any, index) => (
                            <Card variant="black" key={index} className={classes.transactionListItem}>
                                <Label>TRANSACTION ID</Label>
                                <Value>
                                    <NavLink to={`/transactions/details/${transaction.id}`}>{transaction.id}</NavLink>
                                </Value>
                            </Card>
                        ))}
                </DetailsTabItem>

                <DetailsTabItem label="COLLECTIONS" value={2} />
            </DetailsTabs>
        </div>
    );
};

export default Details;
