const solc = require("solc");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "../contracts/ReputationRegistry.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: { "contracts/ReputationRegistry.sol": { content: source } },
  settings: {
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
    optimizer: { enabled: true, runs: 200 },
  },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errs = (out.errors || []).filter((e) => e.severity === "error");
if (errs.length) { errs.forEach((e) => console.error(e.formattedMessage)); process.exit(1); }
const c = out.contracts["contracts/ReputationRegistry.sol"]["ReputationRegistry"];
fs.mkdirSync("artifacts/contracts/ReputationRegistry.sol", { recursive: true });
fs.writeFileSync(
  "artifacts/contracts/ReputationRegistry.sol/ReputationRegistry.json",
  JSON.stringify({
    _format: "hh-sol-artifact-1",
    contractName: "ReputationRegistry",
    sourceName: "contracts/ReputationRegistry.sol",
    abi: c.abi,
    bytecode: "0x" + c.evm.bytecode.object,
    deployedBytecode: "0x" + c.evm.deployedBytecode.object,
    linkReferences: {},
    deployedLinkReferences: {},
  }, null, 2)
);
console.log("Compiled OK | ABI:", c.abi.length, "| Bytecode:", c.evm.bytecode.object.length / 2, "bytes");
