import { useEffect, useState } from 'react';
import '../config/flow-fcl';
// @ts-ignore
import * as fcl from '@onflow/fcl';
// @ts-ignore
import * as t from '@onflow/types';
import { toast } from 'react-hot-toast';

export type FlowScriptArgument = { value: any; type: string };

export function useFlow() {
    const [user, setUser] = useState({ loggedIn: null });

    useEffect(() => fcl.currentUser().subscribe(setUser), []);

    async function sendTransaction(code: string, args: FlowScriptArgument[]) {
        const transactionId = await fcl.mutate({
            cadence: code,
            args: (arg: any, t: any) => args.map((e) => arg(e.value, t[e.type])),
            payer: fcl.authz,
            proposer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 50,
        });

        return {
            transactionId,
            status: await fcl.tx(transactionId).onceSealed(),
        };
    }

    async function logout() {
        try {
            await fcl.unauthenticate();
            toast('Logged out!');
        } catch (e: any) {
            console.log(e);
            toast.error(`Logout failed: ${e.message}`);
        }
    }

    async function login() {
        try {
            const result = await fcl.authenticate();
            if (result.loggedIn) {
                toast('Logged in!');
            }
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
