import React, { FunctionComponent } from 'react';
import classes from './ContentDetailsKeys.module.scss';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import { ReactComponent as KeyIcon } from '../../../shared/assets/icons/key.svg';

interface OwnProps {
    keys: any[]; // TODO: define type
}

type Props = OwnProps;

const ContentDetailsKeys: FunctionComponent<Props> = ({ keys }) => {
    return (
        <>
            {keys.map((key, index) => (
                <Card key={index} className={classes.root} variant="black">
                    <Label variant="large">KEY</Label>
                    <div>
                        <KeyIcon className={classes.keyIcon} />
                        <span className={classes.blueBg}>{key}</span>
                    </div>
                </Card>
            ))}
        </>
    );
};

export default ContentDetailsKeys;
