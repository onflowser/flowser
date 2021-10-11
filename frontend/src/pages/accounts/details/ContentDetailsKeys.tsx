import React, { FunctionComponent } from 'react';
import classes from './ContentDetailsKeys.module.scss';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import CopyButton from '../../../shared/components/copy-button/CopyButton';
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
                        <span className={classes.blueBg}>{key.publicKey}</span>
                        <CopyButton value={key.publicKey} />
                    </div>
                    <div className={classes.badges}>
                        <span>
                            WEIGHT: <span>{key.weight}</span>
                        </span>
                        <span>
                            SEQ. NUMBER: <span>{key.sequenceNumber}</span>
                        </span>
                        <span>
                            INDEX: <span>{key.index}</span>
                        </span>
                        <span>
                            SIGN ALGO.: <span>{key.signAlgo}</span>
                        </span>
                        <span>
                            HASH ALGO.: <span>{key.hashAlgo}</span>
                        </span>
                        <span>
                            REVOKED: <span>{key.revoked ? 'YES' : 'NO'}</span>
                        </span>
                    </div>
                </Card>
            ))}
        </>
    );
};

export default ContentDetailsKeys;
