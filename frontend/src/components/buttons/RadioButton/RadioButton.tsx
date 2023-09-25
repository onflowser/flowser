import React, { FunctionComponent, useEffect, useState } from "react";
import classes from "./RadioButton.module.scss";
import classNames from "classnames";

type RadioButtonProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

const RadioButton: FunctionComponent<RadioButtonProps> = ({
  checked = false,
  disabled = false,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const onClick = () => {
    if (!disabled) {
      setIsChecked(true);
      onChange(isChecked);
    }
  };

  return (
    <div
      className={classNames(classes.root, {
        [classes.checked]: isChecked,
        [classes.unchecked]: !isChecked,
        [classes.disabled]: disabled,
      })}
      onClick={onClick}
    >
      <span></span>
    </div>
  );
};

export default RadioButton;
