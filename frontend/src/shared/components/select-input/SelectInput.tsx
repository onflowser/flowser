import React, { ChangeEventHandler, FunctionComponent } from "react";
import classes from "./SelectInput.module.scss";

type SelectInputValue = string | number;

export type SelectInputOption = { label: string; value: SelectInputValue };

type SelectInputProps = {
  placeholder?: string;
  value?: SelectInputValue;
  disabled?: boolean;
  options: SelectInputOption[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
};

const SelectInput: FunctionComponent<SelectInputProps> = ({
  options = [],
  value = "",
  disabled = false,
  onChange,
  ...restProps
}) => {
  return (
    <div className={classes.root}>
      <select
        disabled={disabled}
        value={value}
        onChange={onChange}
        {...restProps}
      >
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
