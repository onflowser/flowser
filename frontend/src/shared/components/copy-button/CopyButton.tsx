import React, { FunctionComponent, useCallback } from 'react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { ReactComponent as CopyIcon } from '../../assets/icons/copy.svg';
import classes from './CopyButton.module.scss';

interface OwnProps {
    value: string;
}
type Props = OwnProps;

const CopyButton: FunctionComponent<Props> = ({ value }) => {
    const copyToClipboard = useCallback(() => {
        copy(value);
        toast(`"${value}" copied to your clipboard`);
    }, []);
    return (
        <span className={classes.root}>
            <CopyIcon onClick={copyToClipboard} />
        </span>
    );
};

export default CopyButton;
