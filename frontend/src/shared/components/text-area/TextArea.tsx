import React, { ForwardRefRenderFunction, FunctionComponent, LegacyRef } from 'react';
import classes from './TextArea.module.scss';

interface OwnProps {
    value?: any;
    disabled?: boolean;
    rows?: number;
    onChange?: (e: any) => void;
    [key: string]: any;
}

type Props = OwnProps;

const TextArea: ForwardRefRenderFunction<HTMLTextAreaElement, Props> = (
    // eslint-disable-next-line react/prop-types
    { rows = 6, value = '', disabled = false, onChange = () => false, ...restProps },
    ref,
) => {
    return (
        <div className={classes.root}>
            <textarea ref={ref} rows={rows} disabled={disabled} value={value} onChange={onChange} {...restProps} />
        </div>
    );
};

export default React.forwardRef(TextArea);
