import React, { FunctionComponent } from 'react';
import Card from '../card/Card';
import classes from './DetailsCard.module.scss';

interface Props {
    children: any;
    Header?: any;
    Footer?: any;
}

const DetailsCard: FunctionComponent<Props> = ({ children, Header, Footer }) => {
    return (
        <div>
            <div className={classes.header}>
                <Header />
            </div>
            <Card className={classes.container}>
                <div className={classes.body}>{children}</div>
                {Footer && (
                    <div className={classes.footer}>
                        <Footer />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DetailsCard;
