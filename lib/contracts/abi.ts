// Auto-derived from contracts-workspace/artifacts after compiling
// ReputationRegistry.sol. Re-run contracts-workspace/scripts/compile-direct.js
// and copy the .abi field here if the contract source changes.
export const reputationRegistryAbi = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "paymentId", "type": "bytes32" }],
    "name": "DuplicateRating",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "uint8", "name": "score", "type": "uint8" }],
    "name": "InvalidScore",
    "type": "error"
  },
  { "inputs": [], "name": "SelfRating", "type": "error" },
  { "inputs": [], "name": "ZeroAddress", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "provider", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "rater", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "score", "type": "uint8" },
      { "indexed": true, "internalType": "bytes32", "name": "paymentId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "newTotalScore", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newRatingCount", "type": "uint256" }
    ],
    "name": "RatingSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "rater", "type": "address" },
      { "internalType": "address", "name": "provider", "type": "address" },
      { "internalType": "bytes32", "name": "paymentId", "type": "bytes32" }
    ],
    "name": "hasRated",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "provider", "type": "address" }],
    "name": "getReputation",
    "outputs": [
      { "internalType": "uint256", "name": "totalScore", "type": "uint256" },
      { "internalType": "uint256", "name": "ratingCount", "type": "uint256" },
      { "internalType": "uint256", "name": "averageScoreScaled", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "provider", "type": "address" },
      { "internalType": "uint8", "name": "score", "type": "uint8" },
      { "internalType": "bytes32", "name": "paymentId", "type": "bytes32" }
    ],
    "name": "submitRating",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
