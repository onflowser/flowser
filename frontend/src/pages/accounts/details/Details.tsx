import React, { FunctionComponent, useEffect } from 'react';
import { Breadcrumb, useNavigation } from '../../../shared/hooks/navigation';
import { useSearch } from '../../../shared/hooks/search';
import classes from './Details.module.scss';
import Value from '../../../shared/components/value/Value';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import ContentDetailsScript from '../../../shared/components/content-details-script/ContentDetailsScript';
import ContentDetailsKeys from './ContentDetailsKeys';
import CopyButton from '../../../shared/components/copy-button/CopyButton';
import { DetailsTabItem, DetailsTabs } from '../../../shared/components/details-tabs/DetailsTabs';
import CollapsibleCard from '../../../shared/components/collapsible-card/CollapsibleCard';
import { useDetailsQuery } from '../../../shared/hooks/details-query';
import { useParams } from 'react-router-dom';

type RouteParams = {
    accountId: string;
};

const Details: FunctionComponent<any> = () => {
    const { accountId } = useParams<RouteParams>();
    const { setPlaceholder } = useSearch();
    const { setBreadcrumbs } = useNavigation();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const { data, isLoading } = useDetailsQuery<any>(`/api/accounts/${accountId}`);

    const breadcrumbs: Breadcrumb[] = [{ to: '/accounts', label: 'Accounts' }, { label: 'Details' }];

    useEffect(() => {
        showNavigationDrawer(true);
        showSubNavigation(false);
        setBreadcrumbs(breadcrumbs);
    }, []);

    if (isLoading || !data) {
        return null; // TODO: add proper loader ?
    }

    console.log({ data });

    return (
        <div className={classes.root}>
            <div className={classes.firstRow}>
                <Label variant="large">ADDRESS</Label>
                <Value variant="large">{data.address}</Value>
                <CopyButton value={data.address} />
            </div>
            <Card className={classes.bigCard}>
                <div>
                    <Label variant="large" className={classes.label}>
                        BALANCE
                    </Label>
                    <Value variant="large">{data.balance} FLOW</Value>
                </div>
            </Card>
            <DetailsTabs>
                {!!data.code && (
                    <DetailsTabItem label="SCRIPTS" value="<>">
                        <ContentDetailsScript script={data.code} />
                    </DetailsTabItem>
                )}
                <DetailsTabItem
                    label="CONTRACTS"
                    value={data.contracts.length}
                    onClick={() => setPlaceholder('search for contracts')}
                >
                    {data.contracts.map((contract: any, index: number) => (
                        <CollapsibleCard
                            key={index}
                            isNew={contract.isNew}
                            header="CONTRACT NAME"
                            subheader={contract.name}
                            variant="black"
                            className={classes.script}
                        >
                            <ContentDetailsScript script={contract.code} />
                        </CollapsibleCard>
                    ))}
                </DetailsTabItem>
                <DetailsTabItem label="KEYS" value={data.keys.length} onClick={() => setPlaceholder('search for keys')}>
                    <ContentDetailsKeys keys={data.keys} />
                </DetailsTabItem>
            </DetailsTabs>
        </div>
    );
};

export default Details;
