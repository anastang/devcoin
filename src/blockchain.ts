import * as CryptoJS from 'crypto-js';
import {broadcastLatest} from './p2p';

// Block structure
class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: string){
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    } 
}

const calculateHash = (index: number, previousHash: string, timestamp: number, data: string): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

const calculateHashForBlock = (block: Block): string =>
    calculateHash(block.index,block.previousHash,block.timestamp,block.data);

const addBlock = (newBlock: Block) => {
    if (isBlockValid(newBlock, getLatestBlock())){
        blockchain.push(newBlock);
    }
}

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', '', 1465154705, 'Genesis Block');

const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime()/1000;
    const nextHash: string = calculateHash(nextIndex,previousBlock.hash,nextTimestamp,blockData);
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    addBlock(newBlock);
    broadcastLatest();
    return newBlock;
};

// Storing Blockchain
let blockchain: Block[] = [genesisBlock];

const getBlockchain = (): Block[] => blockchain;

const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

// Validate block integrity
// 1. Index of block must be one larger than previous block
// 2. previousHash of a block must be the same as hash of the previous block
// 3. Hash of the block must be valid
const isBlockValid = (newBlock: Block, previousBlock: Block): boolean => {
    if (previousBlock.index + 1 !== newBlock.index){
        console.log('Index is Invalid');
        return false;
    }
    else if (previousBlock.hash !== newBlock.hash){
        console.log('Previous Hash is Invalid');
        return false;
    }
    else if (calculateHashForBlock(newBlock) !== newBlock.hash){
        console.log('Hash is Invalid');
        return false;
    }
    return true;
};

// Validate block structure
const isBlockStrucValid = (block: Block): boolean => {
    return typeof block.index === 'number' &&  typeof block.hash === 'string' && typeof block.previousHash === 'string' && typeof block.timestamp === 'number' && typeof block.data === 'string';
}

// Validate chain of blocks
const isChainValid = (blockchainToValidate: Block[]): boolean => {
    const isGenesisValid = (block:Block): boolean => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    if (!isGenesisValid(blockchainToValidate[0])) {
        return false;
    }

    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!isBlockValid(blockchainToValidate[i], blockchainToValidate[i-1])){
            return false;
        }
    }
    return true;
}

// Overriding shorter chain for blocks with same number
const replaceChain = (newBlocks: Block[]) => {
    if (isChainValid(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Replacing current blockchain with receieved blockchain');
        blockchain = newBlocks;
        broadcastLatest();
    } else {
        console.log('Received blockchain invalid');
    }
};

const addBlockToChain = (newBlock: Block) => {
    if (isBlockValid(newBlock, getLatestBlock())){
        blockchain.push(newBlock);
        return true;
    }
    return false;
};

export {Block, getBlockchain, getLatestBlock, generateNextBlock, isBlockStrucValid, replaceChain, addBlockToChain};