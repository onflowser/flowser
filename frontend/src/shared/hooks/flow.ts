import { useEffect, useState } from 'react';
import '../config/flow-fcl';
// @ts-ignore
import * as fcl from '@onflow/fcl';

export function useFlow() {
    const [user, setUser] = useState(null);

    useEffect(() => fcl.currentUser().subscribe(setUser), []);

    async function sendTransaction(code: string) {
        const transactionId = await fcl.mutate({
            cadence: code,
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 50,
        });

        const transaction = await fcl.tx(transactionId).onceSealed();
        console.log(transaction);
    }

    return {
        login: fcl.authenticate,
        logout: fcl.unauthenticate,
        user,
        sendTransaction,
    };
}
