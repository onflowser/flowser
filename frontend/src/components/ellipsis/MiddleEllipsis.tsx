import React, { FunctionComponent, useRef } from "react";

export type EllipsisProps = {
  children: string;
  delimiter?: string;
  className?: string;
  style?: React.CSSProperties;
};

const MiddleEllipsis: FunctionComponent<EllipsisProps> = ({
  children,
  delimiter = "...",
  className,
  style,
}) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const pieceLength = 10;
  const ellipsisText =
    children.substring(0, pieceLength) +
    delimiter +
    children.substring(children.length - pieceLength, children.length);

  return (
    <span ref={elRef} className={className} style={style}>
      {ellipsisText}
    </span>
  );
};

export default MiddleEllipsis;
