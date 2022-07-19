import React, { FunctionComponent, useEffect } from "react";

interface OwnProps {
  onMount: () => void;
  children: any;
}

type Props = OwnProps;

const Fragment: FunctionComponent<Props> = ({ onMount, children }) => {
  useEffect(() => onMount(), []);
  return <React.Fragment>{children}</React.Fragment>;
};

export default Fragment;
