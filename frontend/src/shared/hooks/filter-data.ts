export interface UseFilterDataHook<T> {
    filteredData: T;
}

export const useFilterData = <T>(data: T[], search: string, props?: string[]): UseFilterDataHook<T[]> => {
    if (!Array.isArray(data) || data.length === 0) {
        return { filteredData: data };
    }

    props = props || Object.keys(data[0]);
    const filteredData = data.filter((item) => JSON.stringify(item, props).indexOf(search.toString()) !== -1);
    return { filteredData };
};
