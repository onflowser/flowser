import React, { FunctionComponent } from 'react';
import classes from './SelectInput.module.scss';

interface OwnProps {
    value?: any;
    disabled?: boolean;
    onChange?: (e: any) => void;
    options: { label: any; value: any }[];
    [key: string]: any;
}

type Props = OwnProps;

const SelectInput: FunctionComponent<Props> = ({
    options = [],
    value = '',
    disabled = false,
    onChange = () => false,
    ...restProps
}) => {
    return (
        <div className={classes.root}>
            <select disabled={disabled} value={value} onChange={onChange} {...restProps}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectInput;
