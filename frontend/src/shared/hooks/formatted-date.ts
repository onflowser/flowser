import dateFormat from 'dateformat';

export interface UseFormattedDateHook {
    formatDate: (date: string) => string;
}

// TODO: Move to some config
export const DATE_FORMAT = 'dS mmm yyyy hh:MM:ss';

export const useFormattedDate = (): UseFormattedDateHook => {
    const formatDate = (date: string): string => {
        return dateFormat(date, DATE_FORMAT);
    };

    return {
        formatDate,
    };
};
