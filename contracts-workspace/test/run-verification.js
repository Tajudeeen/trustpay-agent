// Executable verification for ReputationRegistry.
// Loads the pre-compiled artifact (see compile-direct.js) and runs the same
// scenarios as test/ReputationRegistry.t.sol against Hardhat's in-process
// EVM, since this sandbox cannot reach binaries.soliditylang.org to let
// Hardhat's own downloader fetch solc. This file is a verification harness,
// not a replacement for the Foundry suite, which is the portable source of truth.

const hre = require("hardhat");
const { expect } = require("chai");
const fs = require("fs");

async function main() {
  const results = [];
  const record = (name, fn) => results.push({ name, fn });

  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/ReputationRegistry.sol/ReputationRegistry.json", "utf8")
  );

  const [deployer, rater1, rater2, provider] = await hre.ethers.getSigners();

  async function deploy() {
    const factory = new hre.ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    return contract;
  }

  record("submitRating stores correct total/count/average", async () => {
    const registry = await deploy();
    const paymentId = hre.ethers.id("payment-1");
    await (await registry.connect(rater1).submitRating(provider.address, 5, paymentId)).wait();
    const [total, count, avg] = await registry.getReputation(provider.address);
    expect(total).to.equal(5n);
    expect(count).to.equal(1n);
    expect(avg).to.equal(500n);
  });

  record("average computes correctly across multiple ratings", async () => {
    const registry = await deploy();
    await (await registry.connect(rater1).submitRating(provider.address, 5, hre.ethers.id("p1"))).wait();
    await (await registry.connect(rater2).submitRating(provider.address, 2, hre.ethers.id("p2"))).wait();
    const [total, count, avg] = await registry.getReputation(provider.address);
    expect(total).to.equal(7n);
    expect(count).to.equal(2n);
    expect(avg).to.equal(350n);
  });

  record("reverts on score = 0", async () => {
    const registry = await deploy();
    await expect(
      registry.connect(rater1).submitRating(provider.address, 0, hre.ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "InvalidScore");
  });

  record("reverts on score = 6", async () => {
    const registry = await deploy();
    await expect(
      registry.connect(rater1).submitRating(provider.address, 6, hre.ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "InvalidScore");
  });

  record("reverts on self-rating", async () => {
    const registry = await deploy();
    await expect(
      registry.connect(provider).submitRating(provider.address, 5, hre.ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "SelfRating");
  });

  record("reverts on duplicate rating (same rater, same payment)", async () => {
    const registry = await deploy();
    const paymentId = hre.ethers.id("p1");
    await (await registry.connect(rater1).submitRating(provider.address, 5, paymentId)).wait();
    await expect(
      registry.connect(rater1).submitRating(provider.address, 1, paymentId)
    ).to.be.revertedWithCustomError(registry, "DuplicateRating");
  });

  record("allows different raters to rate the same paymentId", async () => {
    const registry = await deploy();
    const paymentId = hre.ethers.id("p1");
    await (await registry.connect(rater1).submitRating(provider.address, 5, paymentId)).wait();
    await (await registry.connect(rater2).submitRating(provider.address, 3, paymentId)).wait();
    const [, count] = await registry.getReputation(provider.address);
    expect(count).to.equal(2n);
  });

  record("reverts on zero address provider", async () => {
    const registry = await deploy();
    await expect(
      registry.connect(rater1).submitRating(hre.ethers.ZeroAddress, 5, hre.ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "ZeroAddress");
  });

  record("unrated provider returns all zeroes", async () => {
    const registry = await deploy();
    const [total, count, avg] = await registry.getReputation(rater2.address);
    expect(total).to.equal(0n);
    expect(count).to.equal(0n);
    expect(avg).to.equal(0n);
  });

  record("hasRated reflects submission state accurately", async () => {
    const registry = await deploy();
    const paymentId = hre.ethers.id("p1");
    expect(await registry.hasRated(rater1.address, provider.address, paymentId)).to.equal(false);
    await (await registry.connect(rater1).submitRating(provider.address, 4, paymentId)).wait();
    expect(await registry.hasRated(rater1.address, provider.address, paymentId)).to.equal(true);
    expect(await registry.hasRated(rater2.address, provider.address, paymentId)).to.equal(false);
  });

  record("emits RatingSubmitted with correct args", async () => {
    const registry = await deploy();
    const paymentId = hre.ethers.id("p1");
    await expect(registry.connect(rater1).submitRating(provider.address, 5, paymentId))
      .to.emit(registry, "RatingSubmitted")
      .withArgs(provider.address, rater1.address, 5, paymentId, 5n, 1n);
  });

  record("fuzz-equivalent: average always within [100,500] across N ratings", async () => {
    const registry = await deploy();
    const signers = await hre.ethers.getSigners();
    const raterPool = signers.slice(4, 14); // 10 distinct raters
    for (let i = 0; i < raterPool.length; i++) {
      const score = (i % 5) + 1;
      await (
        await registry.connect(raterPool[i]).submitRating(provider.address, score, hre.ethers.id(`p${i}`))
      ).wait();
    }
    const [, , avg] = await registry.getReputation(provider.address);
    expect(avg).to.be.at.least(100n);
    expect(avg).to.be.at.most(500n);
  });

  let pass = 0;
  let fail = 0;
  for (const { name, fn } of results) {
    try {
      await fn();
      console.log(`PASS  ${name}`);
      pass++;
    } catch (err) {
      console.log(`FAIL  ${name}`);
      console.log(`      ${err.message}`);
      fail++;
    }
  }

  console.log(`\n${pass} passed, ${fail} failed, ${results.length} total`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
