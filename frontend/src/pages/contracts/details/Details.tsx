import React, { FunctionComponent, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import DetailsCard from '../../../shared/components/details-card/DetailsCard';
import ContentDetailsScript from '../../../shared/components/content-details-script/ContentDetailsScript';
import { Breadcrumb, useNavigation } from '../../../shared/hooks/navigation';
import { useDetailsQuery } from '../../../shared/hooks/details-query';

type RouteParams = {
    contractId: string;
};

const Details: FunctionComponent<any> = () => {
    const { contractId } = useParams<RouteParams>();
    const { setBreadcrumbs, showSearchBar } = useNavigation();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const { isLoading, data } = useDetailsQuery(`/api/contracts/${contractId}`);

    const breadcrumbs: Breadcrumb[] = [{ to: '/contracts', label: 'Contracts' }, { label: 'Details' }];

    useEffect(() => {
        showNavigationDrawer(true);
        showSubNavigation(false);
        setBreadcrumbs(breadcrumbs);
        showSearchBar(false);
    }, []);

    if (isLoading || !data) {
        return null;
    }

    return (
        <div>
            <DetailsCard>
                <div>
                    <Label variant="large">NAME</Label>
                    <Value variant="large">{data.name}</Value>
                </div>
                <div>
                    <Label variant="large">ACCOUNT</Label>
                    <Value variant="large">
                        <NavLink to={`/accounts/details/${data.accountAddress}`}>{data.accountAddress}</NavLink>
                    </Value>
                </div>
            </DetailsCard>
            <ContentDetailsScript script={data.code} />
        </div>
    );
};

export default Details;
