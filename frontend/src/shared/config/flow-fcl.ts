// @ts-ignore
import * as fcl from '@onflow/fcl';

fcl.config()
    // flowser app details
    .put('app.detail.icon', 'http://localhost:3000/favicon.ico')
    .put('app.detail.title', 'Flowser')
    // Point App at Emulator
    .put('accessNode.api', process.env.REACT_APP_FLOW_ACCESS_NODE)
    // Point FCL at dev-wallet (default port)
    .put('discovery.wallet', process.env.REACT_APP_FLOW_DISCOVERY_WALLET);
