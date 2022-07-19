import React, { FunctionComponent, useEffect, useState } from "react";
import classes from "./RadioButton.module.scss";

interface OwnProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

type Props = OwnProps;

const RadioButton: FunctionComponent<Props> = ({
  checked = false,
  onChange,
}) => {
  const [state, setState] = useState(checked);

  useEffect(() => {
    setState(checked);
  }, [checked]);

  const onClick = () => {
    setState(true);
    onChange(state);
  };

  return (
    <div
      className={`${classes.root} ${
        state ? classes.checked : classes.unchecked
      }`}
      onClick={onClick}
    >
      <span></span>
    </div>
  );
};

export default RadioButton;
