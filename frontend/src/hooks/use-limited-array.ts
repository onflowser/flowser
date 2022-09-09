import { useMemo, useState } from "react";

export type LimitedArrayState<DataItem> = {
  isExpanded: boolean;
  showMore: () => void;
  showLess: () => void;
  hiddenCount: number;
  data: DataItem[];
};

export function useLimitedArray<DataItem>(
  data: DataItem[],
  limit = 5
): LimitedArrayState<DataItem> {
  const [isExpanded, setExpanded] = useState(false);

  function showMore() {
    setExpanded(true);
  }

  function showLess() {
    setExpanded(false);
  }

  const limitedData = useMemo(
    () => (isExpanded ? data : data.slice(0, limit)),
    [data, isExpanded]
  );

  return {
    isExpanded,
    showMore,
    showLess,
    hiddenCount: data.length - limitedData.length,
    data: limitedData,
  };
}
