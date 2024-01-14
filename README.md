# 💰Devcoin
Devcoin is a simplified blockchain implementation designed for educational purposes. This project aims to provide a clear and understandable example of a blockchain system. It includes basic functionalities such as mining, transactions, and a wallet system.

## Getting Started
```
npm install
npm start
```

## Basic Commands

### Get Blockchain
Retrieve the current state of the blockchain. This command provides information about all the blocks in the chain.

```
curl http://localhost:3001/blocks
```

### Mine a Block
Mine a new block and add it to the blockchain. Mining involves solving a computational puzzle to validate and append transactions to the ledger.

```
curl -X POST http://localhost:3001/mineBlock
```

### Send Transaction
Initiate a transaction by sending coins to a specific address. This command creates a new transaction, updating the blockchain with the transfer.

```
curl -H "Content-type: application/json" --data '{"address": "<recipient_address>", "amount" : <amount>}' http://localhost:3001/sendTransaction
```

### Query Transaction Pool
Retrieve information about the current transaction pool. The transaction pool contains unconfirmed transactions waiting to be mined.

```
curl http://localhost:3001/transactionPool
```

### Mine Transaction
Mine pending transactions to include them in the blockchain. This command is crucial for validating and confirming transactions.

```
curl -H "Content-type: application/json" --data '{"address": "<recipient_address>", "amount" : <amount>}' http://localhost:3001/mineTransaction
```

### Get Balance
Check the balance of your wallet. This command provides information about the total amount of coins associated with your wallet's address.

```
curl http://localhost:3001/balance
```

### Query Information about a Specific Address
Retrieve detailed information about a specific address, including unspent transaction outputs. This information aids in understanding the transaction history for a particular address.

```
curl http://localhost:3001/address/<address>
```

### Add Peer
Connect your node to a new peer. Peers are essential for the decentralization of the blockchain network.

```
curl -H "Content-type:application/json" --data '{"peer" : "<peer_url>"}' http://localhost:3001/addPeer
```

### Query Connected Peers
Retrieve a list of connected peers. Understanding the network's peer connections is crucial for maintaining a decentralized blockchain.

```
curl http://localhost:3001/peers
```

***
Feel free to explore and experiment with these commands to gain a better understanding of blockchain concepts and the Naivecoin implementation.
