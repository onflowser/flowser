import React, { FunctionComponent } from 'react';
import classes from './ContentDetailsKeys.module.scss';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import CopyButton from '../../../shared/components/copy-button/CopyButton';
import { ReactComponent as KeyIcon } from '../../../shared/assets/icons/key.svg';
import Badge from '../../../shared/components/badge/Badge';

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
                        <span className={classes.blueBg}>{key.publicKey}</span>
                        <CopyButton value={key.publicKey} />
                    </div>
                    <div className={classes.badges}>
                        <Badge>WEIGHT: {key.weight}</Badge>
                        <Badge>SEQ. NUMBER: {key.sequenceNumber}</Badge>
                        <Badge>INDEX: {key.index}</Badge>
                        {/*TODO: Here should be SHA_265 etc. instead of number */}
                        <Badge>SIGN ALGO.: {key.signAlgo} (SHA_265)!</Badge>
                        {/*TODO: Here should be SHA_265 etc. instead of number */}
                        <Badge>HASH ALGO.: {key.hashAlgo} (SHA_265)!</Badge>
                        <Badge>REVOKED: {key.revoked ? 'YES' : 'NO'}</Badge>
                    </div>
                </Card>
            ))}
        </>
    );
};

export default ContentDetailsKeys;
