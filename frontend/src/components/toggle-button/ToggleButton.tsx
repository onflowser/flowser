import React, { FunctionComponent } from "react";
import classes from "./ToggleButton.module.scss";

export type ToggleButtonProps = {
  value?: boolean;
  onChange?: (state: boolean) => void;
};

const ToggleButton: FunctionComponent<ToggleButtonProps> = ({
  value = false,
  onChange = () => false,
}) => {
  return (
    <div className={classes.root}>
      <div onClick={() => onChange(!value)}>
        {/* FIXME: max-width is applied on Configuration screen and breaks this layout */}
        <span
          style={{ margin: 0 }}
          className={`${value ? classes.active : classes.inactive}`}
        />
      </div>
    </div>
  );
};

export default ToggleButton;
