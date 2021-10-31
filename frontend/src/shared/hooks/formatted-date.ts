import dateFormat from 'dateformat';
import { DATE_FORMAT } from '../constants/common';

export interface UseFormattedDateHook {
    formatDate: (date: string) => string;
}

export const useFormattedDate = (): UseFormattedDateHook => {
    const formatDate = (date: string): string => {
        return dateFormat(date, DATE_FORMAT);
    };

    return {
        formatDate,
    };
};
