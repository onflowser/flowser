import React, { FunctionComponent } from 'react';
import sampleData from '../data.json';
import { useParams } from 'react-router-dom';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import DetailsCard from '../../../shared/components/details-card/DetailsCard';
import { NavLink } from 'react-router-dom';
import classes from './Details.module.scss';
import DetailsItem from '../../../shared/components/details-item/DetailsItem';

type RouteParams = {
    transactionId: string;
};

const Details: FunctionComponent<any> = () => {
    const { transactionId } = useParams<RouteParams>();
    const data = sampleData.find((e) => e._id === transactionId) as any;

    return (
        <div>
            <DetailsCard
                Header={() => (
                    <>
                        <div>
                            <Label>TRANSACTION</Label>
                            <Value>{data._id}</Value>
                        </div>
                        <div>
                            <Label>STATUS</Label>
                            <Value>{data.status.statusCode}</Value>
                        </div>
                    </>
                )}
                Footer={() => (
                    <>
                        <div>
                            <Label>icon</Label>
                            <Value>55min ago</Value>
                        </div>
                        <div>
                            <Label>icon</Label>
                            <Value>18 August 2021</Value>
                        </div>
                    </>
                )}
            >
                <div>
                    <Label>TRANSACTION</Label>
                    <Value>{data._id}</Value>
                </div>
                <div>
                    <Label>BLOCK</Label>
                    <Value>
                        <NavLink to={`/blocks/details/${data.referenceBlockId}`}>{data.referenceBlockId}</NavLink>
                    </Value>
                </div>
                <div>
                    <Label>PROPOSER</Label>
                    <Value>
                        <NavLink to={`/accounts/details/${data.proposalKey.address}`}>
                            {data.proposalKey.address}
                        </NavLink>
                    </Value>
                </div>
                <div>
                    <Label>PAYER</Label>
                    <Value>
                        <NavLink to={`/accounts/details/${data.payer}`}>{data.payer}</NavLink>
                    </Value>
                </div>
                <div>
                    <Label className={classes.authorizersLabel}>AUTHORIZERS</Label>
                    <Value>
                        {data.authorizers.map((address: string) => (
                            <NavLink key={address} className={classes.authorizersAddress} to={`/accounts/${address}`}>
                                {address}
                            </NavLink>
                        ))}
                    </Value>
                </div>
            </DetailsCard>
            <div className={classes.detailsItemsWrapper}>
                <DetailsItem label="EVENTS" value={12} onClick={console.log} />
                <DetailsItem label="EVENTS" value={12} />
                <DetailsItem label="EVENTS" value={12} />
                <DetailsItem label="EVENTS" value={12} onClick={console.log} />
            </div>
        </div>
    );
};

export default Details;
