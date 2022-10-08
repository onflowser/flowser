import React, { ReactElement } from "react";

export type SizedBoxProps = {
  height?: number;
  width?: number;
  className?: string;
  children?: React.ReactNode;
};

export function SizedBox(props: SizedBoxProps): ReactElement {
  const { height, width, children, className } = props;
  return (
    <div
      className={className}
      style={{
        height: height,
        minHeight: height,
        width: width,
        minWidth: width,
      }}
    >
      {children}
    </div>
  );
}
