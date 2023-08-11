import React, { ReactElement } from "react";
import { Spinner } from "./Spinner";
import { SizedBox } from "../sized-box/SizedBox";

type SpinnerWithLabelProps = {
  label: string;
};

export function SpinnerWithLabel(props: SpinnerWithLabelProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Spinner size={50} />
      <SizedBox height={10} />
      <span>{props.label}</span>
    </div>
  );
}
