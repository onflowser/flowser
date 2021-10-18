import React, { FunctionComponent, useEffect } from 'react';
import sampleData from '../data.json';
import { NavLink, useParams } from 'react-router-dom';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import DetailsCard from '../../../shared/components/details-card/DetailsCard';
import ContentDetailsScript from '../../../shared/components/content-details-script/ContentDetailsScript';
import { useSearch } from '../../../shared/hooks/search';
import { Breadcrumb, useNavigation } from '../../../shared/hooks/navigation';

type RouteParams = {
    contractId: string;
};

const Details: FunctionComponent<any> = () => {
    const { setPlaceholder } = useSearch();
    const { setBreadcrumbs, showSearchBar } = useNavigation();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();

    const breadcrumbs: Breadcrumb[] = [{ to: '/contracts', label: 'Contracts' }, { label: 'Details' }];

    useEffect(() => {
        showNavigationDrawer(true);
        showSubNavigation(false);
        setBreadcrumbs(breadcrumbs);
        showSearchBar(false);
    }, []);

    const { contractId } = useParams<RouteParams>();
    const data = sampleData.find((e) => e._id === contractId) as any;

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
