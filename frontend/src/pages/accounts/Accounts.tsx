import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';
import { Breadcrumb, useNavigation } from '../../shared/hooks/navigation';

const Accounts = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { isShowBackButtonVisible, setBreadcrumbs } = useNavigation();

    const breadcrumns: Breadcrumb[] = [
        { to: '/accounts', label: 'Account' },
        { to: '/accounts', label: 'block details' },
    ];

    useEffect(() => {
        setPlaceholder('Search accounts');
        setBreadcrumbs(breadcrumns);
    }, []);

    return (
        <div>
            <h2>Accounts</h2>
            <span>Search value: {searchTerm}</span>
        </div>
    );
};

export default Accounts;
