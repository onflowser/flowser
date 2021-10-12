import React, { FunctionComponent } from 'react';
import sampleData from '../data.json';
import { useParams } from 'react-router-dom';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import DetailsCard from '../../../shared/components/details-card/DetailsCard';
import { NavLink } from 'react-router-dom';
import classes from './Details.module.scss';
import { DetailsTabItem, DetailsTabs } from '../../../shared/components/details-tabs/DetailsTabs';
import ContentDetailsScript from '../../../shared/components/content-details-script/ContentDetailsScript';
import Card from '../../../shared/components/card/Card';
import TimeAgo from '../../../shared/components/time-ago/TimeAgo';
import DateWithCalendar from '../../../shared/components/date-with-calendar/DateWithCalendar';

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
                        <TimeAgo date={'2021-10-12T20:37:20.631Z'} />
                        <DateWithCalendar date={'2021-10-12T20:37:20.631Z'} />
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
            <DetailsTabs>
                <DetailsTabItem label="SCRIPT" value="<>">
                    <ContentDetailsScript script={data.script} />
                </DetailsTabItem>
                <DetailsTabItem label="GAS LIMIT" value={9000} />
                <DetailsTabItem label="PAYLOAD SIGNATURES" value={11}>
                    <div>List of signatures</div>
                </DetailsTabItem>
                <DetailsTabItem label="ENVELOPE SIGNATURES" value={31}>
                    {data.envelopeSignatures.map((item: any, i: number) => (
                        <Card key={i}>
                            <div>
                                <Label className={classes.label}>ACCOUNT ADDRESS</Label>
                                <Value>
                                    <NavLink to={`/accounts/details/${item.address}`}>{item.address}</NavLink>
                                </Value>
                            </div>
                            <div>
                                <Label className={classes.label}>KEY ID</Label>
                                <Value>{item.keyId}</Value>
                            </div>
                            <div>
                                <Label className={classes.label}>SIGNATURE</Label>
                                <Value>{item.signature}</Value>
                            </div>
                        </Card>
                    ))}
                </DetailsTabItem>
                <DetailsTabItem label="EVENTS" value={6}>
                    <div>List of signatures</div>
                </DetailsTabItem>
            </DetailsTabs>
        </div>
    );
};

export default Details;
