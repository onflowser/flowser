declare module "*.module.scss" {
  const value: Record<string, string>;
  export default value;
}

// TODO(milestone-5): Fix .svg module to define svg react component
// https://parceljs.org/languages/svg/#importing-as-a-react-component

declare module "*.svg" {
  const content: any;
  export default content;
}
