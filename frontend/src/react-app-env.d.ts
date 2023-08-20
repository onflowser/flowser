// TODO(milestone-x): Fix TS1084: Invalid 'reference' directive syntax.
// <reference shared="react-scripts" />

// For now let's just manually declare required modules.
declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.jpg";
declare module "*.png";
