import React, { FC, useEffect, useState } from 'react';
import classes from './ScriptArguments.module.scss';
import Input from '../input/Input';
// @ts-ignore
import * as t from '@onflow/types';
import SelectInput from '../select-input/SelectInput';
import Button from '../button/Button';
import { FlowScriptArgument } from '../../hooks/flow';
import IconButton from '../icon-button/IconButton';
import { ReactComponent as DeleteIcon } from '../../assets/icons/cancel.svg';

type Props = {
    className: string;
    onChange: (value: FlowScriptArgument[]) => void;
};

const ScriptArguments: FC<Props> = ({ className, onChange }) => {
    const [args, setArgs] = useState<FlowScriptArgument[]>([]);

    function updateArgs(value: any, index: number) {
        const tempArgs: any = args;
        tempArgs[index] = value;
        setArgs(tempArgs);
    }

    function onRemove(index: number) {
        const tempArgs: any = args;
        tempArgs.splice(index, 1);
        setArgs(tempArgs);
    }

    function onAddArg() {
        setArgs([...args, { value: null, type: null }]);
    }

    useEffect(() => {
        onChange(args);
    }, [args]);

    return (
        <div className={`${classes.root} ${className}`}>
            <div className={classes.arguments}>
                {args.map((arg, i) => (
                    <ArgumentItem
                        key={i}
                        onChange={(value) => updateArgs(value, i)}
                        onRemove={() => onRemove(i)}
                        value={arg}
                    />
                ))}
            </div>
            <Button className={classes.addButton} onClick={onAddArg}>
                Add argument
            </Button>
        </div>
    );
};

type ArgumentItemProps = {
    onChange: (value: FlowScriptArgument) => void;
    onRemove: () => void;
    value: FlowScriptArgument;
};

const flowTypes = Object.keys(t).filter((type) => typeof t[type] !== 'function');

const ArgumentItem: FC<ArgumentItemProps> = ({ onChange, onRemove, value: { value, type } }) => (
    <div className={classes.argument}>
        <div>
            <Input placeholder="Value" value={value} onChange={(e) => onChange({ value: e.target.value, type })} />
        </div>
        <div>
            <SelectInput
                placeholder="Type"
                value={type}
                onChange={(e) => onChange({ value, type: e.target.value })}
                options={flowTypes.map((typeName) => ({
                    label: typeName,
                    value: typeName,
                }))}
            />
        </div>
        <div>
            <IconButton
                className={classes.removeButton}
                icon={<DeleteIcon />}
                onClick={onRemove}
                iconPosition="before"
            />
        </div>
    </div>
);

export default ScriptArguments;
