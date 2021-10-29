import React, { FunctionComponent } from 'react';
import classes from './TextArea.module.scss';

interface OwnProps {
    value?: any;
    disabled?: boolean;
    rows?: number;
    onChange?: (e: any) => void;
    [key: string]: any;
}

type Props = OwnProps;

const TextArea: FunctionComponent<Props> = ({
    rows = 6,
    value = '',
    disabled = false,
    onChange = () => false,
    ...restProps
}) => {
    return (
        <div className={classes.root}>
            <textarea rows={rows} disabled={disabled} value={value} onChange={onChange} {...restProps} />
        </div>
    );
};

export default TextArea;
