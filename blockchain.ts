import * as CryptoJS from 'crypto-js';

// Block Structure
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

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', '', 1465154705, 'Genesis Block');

const generateNextBlock = (blockData: string) => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime()/1000;
    const nextHash: string = calculateHash(nextIndex,previousBlock.hash,nextTimestamp,blockData);
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    return newBlock;
};

// Storing Blockchain
const blockchain: Block[] = [genesisBlock];

// Validate Block Integrity
// 1. Index of block must be one larger than previous block
// 2. previousHash of a block must be the same as hash of the previous block
// 3. Hash of the block must be valid
const isBlockValid = (newBlock: Block, previousBlock: Block) => {
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