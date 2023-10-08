export interface UseFilterDataHook<T> {
  filteredData: T;
}

export const useFilterData = <T>(
  data: T[],
  searchTerm: string | undefined,
  filterByProps?: string[]
): UseFilterDataHook<T[]> => {
  if (!Array.isArray(data) || data.length === 0) {
    return { filteredData: data };
  }

  filterByProps = filterByProps || Object.keys(data[0] as never);
  const filteredData = searchTerm
    ? data.filter(
        (item) =>
          JSON.stringify(item, filterByProps)
            .toLocaleLowerCase()
            .indexOf(searchTerm.toLocaleLowerCase().toString()) !== -1
      )
    : data;
  return { filteredData };
};
