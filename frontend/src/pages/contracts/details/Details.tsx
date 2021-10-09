import React, { FunctionComponent } from 'react';
import sampleData from '../data.json';
import { useParams } from 'react-router-dom';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import DetailsCard from '../../../shared/components/details-card/DetailsCard';
import { NavLink } from 'react-router-dom';
import classes from './Details.module.scss';
import DetailsItem from '../../../shared/components/details-item/DetailsItem';
import { DetailsTabItem, DetailsTabs } from '../../../shared/components/details-tabs/DetailsTabs';
import ContentDetailsScript from '../../../shared/components/content-details-script/ContentDetailsScript';

type RouteParams = {
    contractId: string;
};

const Details: FunctionComponent<any> = () => {
    const { contractId } = useParams<RouteParams>();
    const data = sampleData.find((e) => e._id === contractId) as any;

    return (
        <div>
            <DetailsCard>
                <div>
                    <Label>NAME</Label>
                    <Value>{data.name}</Value>
                </div>
                <div>
                    <Label>ACCOUNT</Label>
                    <Value>
                        <NavLink to={`/accounts/details/${data.accountAddress}`}>{data.accountAddress}</NavLink>
                    </Value>
                </div>
            </DetailsCard>
            <ContentDetailsScript script={data.code} />
        </div>
    );
};

export default Details;
