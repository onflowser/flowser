import React, { FunctionComponent } from "react";
import classes from "./ToggleButton.module.scss";
import classNames from "classnames";

export type ToggleButtonProps = {
  value?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (state: boolean) => void;
};

const ToggleButton: FunctionComponent<ToggleButtonProps> = ({
  value: active = false,
  disabled = false,
  className,
  onChange = () => false,
}) => {
  function onClick() {
    if (!disabled) {
      onChange(!active);
    }
  }

  return (
    <div className={classNames(classes.root, className)}>
      <div onClick={onClick}>
        {/* FIXME: max-width is applied on Configuration screen and breaks this layout */}
        <span
          style={{ margin: 0 }}
          className={classNames({
            [classes.active]: active,
            [classes.inactive]: !active,
            [classes.disabled]: disabled,
          })}
        />
      </div>
    </div>
  );
};

export default ToggleButton;
