import React from 'react';
import { DetailsTabItem, DetailsTabs } from '../../../shared/components/details-tabs/DetailsTabs';

const Details = () => (
    <DetailsTabs>
        <DetailsTabItem label="Test 1" value={12}>
            <div>Hello Test 1</div>
        </DetailsTabItem>
        <DetailsTabItem label="Test 2" value={12} />
        <DetailsTabItem label="Test 2" value={12}>
            <div>Hello Test 2</div>
        </DetailsTabItem>
    </DetailsTabs>
);

export default Details;
