import { useEffect, useState } from 'react';
import '../config/flow-fcl';
// @ts-ignore
import * as fcl from '@onflow/fcl';
// @ts-ignore
import * as t from '@onflow/types';
import { toast } from 'react-hot-toast';

export type FlowScriptArgument = { value: any; type: string };

// https://docs.onflow.org/cadence/language/values-and-types/
function convertToType(value: any, type: string) {
    switch (type) {
        case 'Address':
        case 'Character':
        case 'String':
        case 'Identity':
        case 'Word8':
        case 'Word16':
        case 'Word32':
        case 'Word64':
            return `${value}`;
        case 'Int':
        case 'Int8':
        case 'Int16':
        case 'Int32':
        case 'Int64':
        case 'Int128':
        case 'Int256':
        case 'UInt':
        case 'UInt8':
        case 'UInt16':
        case 'UInt32':
        case 'UInt64':
        case 'UInt128':
        case 'UInt256':
            return parseInt(value);
        case 'Fix64':
        case 'UFix64':
            return parseFloat(value);
        // TODO: add missing type conversions
        default:
            return value;
    }
}

export function useFlow() {
    const [user, setUser] = useState({ loggedIn: null });
    const [isLoggingIn, setLoggingIn] = useState(false);
    const [isLoggingOut, setLoggingOut] = useState(false);

    useEffect(() => fcl.currentUser().subscribe(setUser), []);

    async function sendTransaction(code: string, args: FlowScriptArgument[]) {
        const transactionId = await fcl.mutate({
            cadence: code,
            args: (arg: any, t: any) => args.map((e) => arg(convertToType(e.value, e.type), t[e.type])),
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
        setLoggingOut(true);
        try {
            await fcl.unauthenticate();
            toast('Logged out!');
        } catch (e: any) {
            console.log(e);
            toast.error(`Logout failed: ${e.message}`);
        } finally {
            setLoggingOut(false);
        }
    }

    async function login() {
        setLoggingIn(true);
        try {
            const result = await fcl.authenticate();
            if (result.loggedIn) {
                toast('Logged in!');
            }
        } catch (e: any) {
            toast.error(`Login failed: ${e.message}`);
        } finally {
            setLoggingIn(false);
        }
    }

    return {
        login,
        logout,
        user,
        isLoggingIn,
        isLoggingOut,
        isLoggedIn: user.loggedIn,
        sendTransaction,
    };
}
