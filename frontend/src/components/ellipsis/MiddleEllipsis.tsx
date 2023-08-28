import React, { FunctionComponent, useRef } from "react";

export type EllipsisProps = {
  children: string;
  className?: string;
  style?: React.CSSProperties;
};

const MiddleEllipsis: FunctionComponent<EllipsisProps> = ({
  children,
  className,
  style,
}) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const maxLength = 20;

  return (
    <span ref={elRef} className={className} style={style}>
      {trimText(children, maxLength)}
    </span>
  );
};

function trimText(text: string, maxLength: number) {
  const delimiter = "...";
  if (text.length <= maxLength) {
    return text;
  } else {
    return (
      text.substring(0, maxLength / 2) +
      delimiter +
      text.substring(text.length - maxLength / 2, text.length)
    );
  }
}

export default MiddleEllipsis;
