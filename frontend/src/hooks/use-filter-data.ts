export interface UseFilterDataHook<T> {
  filteredData: T;
}

export const useFilterData = <T>(
  data: T[],
  search: string,
  filterByProps?: string[]
): UseFilterDataHook<T[]> => {
  if (!Array.isArray(data) || data.length === 0) {
    return { filteredData: data };
  }

  filterByProps = filterByProps || Object.keys(data[0]);
  const filteredData = data.filter(
    (item) =>
      JSON.stringify(item, filterByProps)
        .toLocaleLowerCase()
        .indexOf(search.toLocaleLowerCase().toString()) !== -1
  );
  return { filteredData };
};
