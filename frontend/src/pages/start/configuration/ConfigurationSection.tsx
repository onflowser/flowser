import React, { FC } from "react";
import classes from "./ConfigurationSection.module.scss";
import classNames from "classnames";
import ToggleButton from "../../../components/toggle-button/ToggleButton";

export type ConfigurationSectionProps = {
  title: string;
  isToggleable?: boolean;
  toggleButtonTitle?: string;
  className?: string;
  isEnabled?: boolean;
  onToggleEnabled?: (isEnabled: boolean) => void;
};

export const ConfigurationSection: FC<ConfigurationSectionProps> = ({
  title,
  isToggleable,
  toggleButtonTitle,
  children,
  className,
  isEnabled,
  onToggleEnabled,
}) => {
  const showBody = !isToggleable || isEnabled;
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.header}>
        <h3 className={classes.title}>{title}</h3>
        {isToggleable && (
          <div className={classes.toggleWrapper}>
            <span>{toggleButtonTitle}</span>
            <ToggleButton
              value={isEnabled}
              onChange={(value) => onToggleEnabled?.(value)}
            />
          </div>
        )}
      </div>
      <div className={classes.separatorLine} />
      {showBody && <div className={classes.body}>{children}</div>}
    </div>
  );
};
