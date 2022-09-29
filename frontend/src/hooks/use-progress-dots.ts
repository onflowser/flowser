import { useEffect, useState } from "react";

export type ProgressDotsOptions = {
  interval?: number;
};

export type ProgressDotsState = {
  dots: string;
};

export function useProgressDots(
  options?: ProgressDotsOptions
): ProgressDotsState {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotArray = [".", "..", "...", "...."];
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDots(dotArray[count % dotArray.length]);
    }, options?.interval ?? 300);
    return () => clearInterval(interval);
  }, []);

  return { dots };
}
