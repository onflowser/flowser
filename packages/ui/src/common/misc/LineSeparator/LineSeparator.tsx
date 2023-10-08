import classNames from "classnames";
import React, { ReactElement } from "react";
import classes from "./LineSeparator.module.scss";

type HorizontalProps = {
  horizontal: boolean;
};

type VerticalProps = {
  vertical: boolean;
};

type LineSeparatorProps = VerticalProps | HorizontalProps;

export function LineSeparator(props: LineSeparatorProps): ReactElement {
  return (
    <div
      className={classNames(classes.root, {
        [classes.vertical]: isVerticalProps(props) && props.vertical,
        [classes.horizontal]: isHorizontalProps(props) && props.horizontal,
      })}
    />
  );
}

function isVerticalProps(props: LineSeparatorProps): props is VerticalProps {
  return "vertical" in props;
}

function isHorizontalProps(
  props: LineSeparatorProps
): props is HorizontalProps {
  return "horizontal" in props;
}
