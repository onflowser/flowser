import { useEffect, useState } from 'react';
import '../config/flow-fcl';
// @ts-ignore
import * as fcl from '@onflow/fcl';

export function useFlow() {
    const [user, setUser] = useState(null);

    useEffect(() => fcl.currentUser().subscribe(setUser), []);

    return {
        login: fcl.authenticate,
        logout: fcl.unauthenticate,
        user,
    };
}
