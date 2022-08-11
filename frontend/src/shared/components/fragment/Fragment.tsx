import React, { FunctionComponent, useEffect } from "react";

type FragmentProps = {
  onMount: () => void;
};

const Fragment: FunctionComponent<FragmentProps> = ({ onMount, children }) => {
  useEffect(() => onMount(), []);
  return <React.Fragment>{children}</React.Fragment>;
};

export default Fragment;
