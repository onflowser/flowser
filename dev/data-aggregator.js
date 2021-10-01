const fcl = require("@onflow/fcl");

// const ACCESS_NODE = "https://access-testnet.onflow.org";
const ACCESS_NODE = "http://127.0.0.1:8080"; // use default flow http server port 8080

fcl.config().put("accessNode.api", ACCESS_NODE) // Configure FCL's Access Node


async function getBlockByHeight (height) {
  return fcl.send([
    fcl.getBlock(),
    fcl.atBlockHeight(height)
  ]).then(fcl.decode);
}

async function getCollectionById (id) {
  return fcl.send([
    fcl.getCollection(id)
  ]).then(fcl.decode)
}

async function getTransactionById (id) {
  const [data, status] = await Promise.all([
    fcl.send([fcl.getTransaction(id)]).then(fcl.decode),
    fcl.send([fcl.getTransactionStatus(id)]).then(fcl.decode)
  ])
  return {data, status}
}

async function getAccount (address) {
  return fcl.send([
    fcl.getAccount(address)
  ]).then(fcl.decode)
}

async function getBlockData (height) {
  const block = await getBlockByHeight(height);
  const collections = await Promise.all(
    block.collectionGuarantees.map(async guarantee => ({
      blockId: block.id,
      ...await getCollectionById(guarantee.collectionId)
    }))
  )
  const transactions = (await Promise.all(collections.map(collection =>
    Promise.all(collection.transactionIds.map(async txId => ({
      collectionId: collection.id, ...await getTransactionById(txId)
    })))
  ))).flat()
  // find all account addresses that are related to some transaction
  // account can be either a payer, authorizer or both
  // therefore we need to remove duplicate account addresses
  const accountAddresses = Object.keys(transactions
    .map(tx => [...tx.data.authorizers, tx.data.payer])
    .flat()
    .reduce((p, c) => ({...p, [c]: true}), {}))
  const accounts = await Promise.all(accountAddresses.map(getAccount));
  return {
    block,
    collections,
    transactions,
    accounts
  }
}

async function getBlockDataWithinHeightRange(fromHeight, toHeight) {
  if (fromHeight === toHeight) return [];
  return Promise.all(
    Array.from({length: toHeight - fromHeight + 1})
      .map((_, i) => getBlockData(fromHeight + i))
  )
}


// Simple cli command to query all data of block, by block height.
// USAGE:
// - node data-aggregator.js <block-height>
// - node data-aggregator.js <from-height> <to-height>

// arguments
const fromHeight = parseInt(process.argv[2]);
const toHeight = parseInt(process.argv[3]);

// flags
const printJsonFormat = process.argv.includes('--json');
const outputHelp = process.argv.includes('--help');

const USAGE =
  "COMMANDS: \n" +
  "   - node data-aggregator.js <block-height>\n" +
  "   - node data-aggregator.js <from-height> <to-height>\n\n" +
  "FLAGS: \n" +
  "   --json    Output in json format (usefull for storing data in files)\n" +
  "   --help    Output usage help\n"

const isValidHeightArg = value => typeof value === 'number' && !isNaN(value);

if (outputHelp) {
  process.stdout.write(USAGE);
  process.exit(0);
} else if (isValidHeightArg(fromHeight) && isValidHeightArg(toHeight)) {
  getBlockDataWithinHeightRange(fromHeight, toHeight).then(logData)
} else if (isValidHeightArg(fromHeight)) {
  getBlockData(fromHeight).then(logData)
} else {
  error("[Flowser] Error: invalid use.\n\n" + USAGE);
}

function logData (data) {
  if (printJsonFormat) {
    process.stdout.write(JSON.stringify(data, null, 4))
  } else {
    console.dir(data, { depth: null })
  }
}

function error(msg) {
  console.error(msg)
  process.exit(1)
}
