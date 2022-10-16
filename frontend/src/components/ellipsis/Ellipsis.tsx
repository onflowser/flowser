import React, { HTMLAttributes, ReactElement } from "react";

// https://stackoverflow.com/questions/17779293/css-text-overflow-ellipsis-not-working
export function Ellipsis({
  style,
  elementName: Element = "div",
  ...props
}: HTMLAttributes<Element> & {
  elementName?: "div" | "span" | "pre";
}): ReactElement {
  return (
    <Element
      {...props}
      style={{
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}
