// @ts-ignore
import * as fcl from '@onflow/fcl';

fcl.config()
    // Point App at Emulator
    .put('accessNode.api', process.env.REACT_APP_FLOW_ACCESS_NODE)
    // Point FCL at dev-wallet (default port)
    .put('discovery.wallet', 'http://localhost:8701/fcl/authn');
