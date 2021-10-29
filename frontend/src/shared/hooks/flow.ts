import { useEffect, useState } from 'react';
import '../config/flow-fcl';
// @ts-ignore
import * as fcl from '@onflow/fcl';
import { toast } from 'react-hot-toast';

export function useFlow() {
    const [user, setUser] = useState({ loggedIn: null });

    useEffect(() => fcl.currentUser().subscribe(setUser), []);

    async function sendTransaction(code: string) {
        const transactionId = await fcl.mutate({
            cadence: code,
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 50,
        });

        return fcl.tx(transactionId).onceSealed();
    }

    function logout() {
        try {
            return fcl.unauthenticate();
        } catch (e: any) {
            console.log(e);
            toast.error(`Logout failed: ${e.message}`);
        }
    }

    function login() {
        try {
            return fcl.authenticate();
        } catch (e: any) {
            toast.error(`Login failed: ${e.message}`);
        }
    }

    return {
        login,
        logout,
        user,
        isLoggedIn: user.loggedIn,
        sendTransaction,
    };
}
