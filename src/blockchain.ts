import * as CryptoJS from 'crypto-js';
import {broadcastLatest} from './p2p';
import {hexToBinary} from './util';

// Block structure
class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;
    public difficulty: number;
    public nonce: number;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: string, difficulty: number, nonce: number){
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
    } 
}

const BLOCK_GENERATION_INTERVAL: number = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

const calculateHash = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number, nonce: number): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();

const calculateHashForBlock = (block: Block): string =>
    calculateHash(block.index,block.previousHash,block.timestamp,block.data, block.difficulty, block.nonce);

const addBlock = (newBlock: Block) => {
    if (isBlockValid(newBlock, getLatestBlock())){
        blockchain.push(newBlock);
    }
}

const genesisBlock: Block = new Block(
    0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, 'Genesis Block', 0, 0);

const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const difficulty: number = getDifficulty(getBlockchain());
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime()/1000;
    const newBlock: Block = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
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
    if(!isBlockStrucValid(newBlock)){
        console.log('Structure is Invalid');
        return false;
    }
    
    if (previousBlock.index + 1 !== newBlock.index){
        console.log('Index is Invalid');
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash){
        console.log('Previous Hash is Invalid');
        return false;
    }
    else if (!isTimestampValid(newBlock,previousBlock)){
        console.log('Timestamp is Invalid');
        return false;
    }
    else if (!hasValidHash(newBlock)){
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

    if (isChainValid(newBlocks) &&
        getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getBlockchain())) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
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


const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary: string = hexToBinary(hash);
    const requiredPrefix: string = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};

const hashMatchesBlockContent = (block: Block): boolean => {
    const blockHash: string = calculateHashForBlock(block);
    return blockHash === block.hash;
};

const findBlock = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number): Block => {
    let nonce = 0;
    while(true){
        const hash: string = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash,difficulty)){
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};

// Difficluty Logic
const getDifficulty = (aBlockchain: Block[]): number => {
    const latestBlock: Block = aBlockchain[blockchain.length -1];
    if(latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else{
        return latestBlock.difficulty;
    }
}

const getAdjustedDifficulty = (latestBlock: Block, aBlockchain: Block[]) => {
    const prevAdjustmentBlock: Block = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2){
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2){
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
}

const isTimestampValid = (newBlock: Block, previousBlock: Block): boolean => {
    return (previousBlock.timestamp - 60 < newBlock.timestamp) && newBlock.timestamp - 60 < getCurrentTimestamp();
}

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000);

const getAccumulatedDifficulty = (aBlockchain: Block[]): number => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2,difficulty))
        .reduce((a,b) => a+b);
}

const hasValidHash = (block:Block): boolean => {
    if (!hashMatchesBlockContent(block)) {
        console.log('Hash is invalid, received: ' + block.hash);
        return false;
    }
    if(!hashMatchesDifficulty(block.hash, block.difficulty)){
        console.log('Block difficulty not satisfied. Expected: ' + block.difficulty + ' got: ' + block.hash);
    }
    return true;
};

export {Block, getBlockchain, getLatestBlock, generateNextBlock, isBlockStrucValid, replaceChain, addBlockToChain};