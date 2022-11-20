import React, { FC, useState } from "react";
import classes from "./ConfigurationSection.module.scss";
import classNames from "classnames";
import { ReactComponent as OpenIcon } from "assets/icons/open.svg";
import { ReactComponent as CloseIcon } from "assets/icons/close.svg";

export type ConfigurationSectionProps = {
  title: string;
  description?: string;
  className?: string;
  isEnabled?: boolean;
  collapseChildren?: boolean;
};

export const ConfigurationSection: FC<ConfigurationSectionProps> = ({
  title,
  description,
  children,
  className,
  collapseChildren = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(!collapseChildren);
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.header}>
        <div className={classes.leftSection}>
          <h3 className={classes.title}>{title}</h3>
          {description && <p className={classes.description}>{description}</p>}
        </div>
        <div className={classes.rightSection}>
          {collapseChildren && (
            <div
              className={classes.toggleOpenButton}
              onClick={() => setShowAdvanced((show) => !show)}
            >
              <span className={classes.title}>
                {title.toLowerCase()} settings
              </span>
              {showAdvanced ? (
                <CloseIcon className={classes.closeIcon} />
              ) : (
                <OpenIcon className={classes.openIcon} />
              )}
            </div>
          )}
        </div>
      </div>
      <div className={classes.separatorLine} />
      {showAdvanced && <div className={classes.body}>{children}</div>}
    </div>
  );
};
