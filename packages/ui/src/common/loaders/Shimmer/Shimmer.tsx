import { CSSProperties } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export interface ShimmerProps {
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  inline?: boolean;
}

export function Shimmer(props: ShimmerProps) {
  const { height, width, className, style, inline } = props;

  return (
    <Skeleton
      inline={inline ?? false}
      count={1}
      containerClassName={className}
      style={{
        height,
        width,
        borderRadius: 10,
        ...style,
        zIndex: "unset",
      }}
      baseColor="#474752"
      highlightColor="#575762"
      duration={1.6}
    />
  );
}
