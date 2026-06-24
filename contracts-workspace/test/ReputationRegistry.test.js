const { expect } = require("chai");
const fs = require("fs");
const path = require("path");

describe("ReputationRegistry", function () {
  let registry, deployer, rater1, rater2, provider;

  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/ReputationRegistry.sol/ReputationRegistry.json"),
      "utf8"
    )
  );

  beforeEach(async function () {
    [deployer, rater1, rater2, provider] = await ethers.getSigners();
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
    registry = await factory.deploy();
    await registry.waitForDeployment();
  });

  it("stores correct total/count/average after one rating", async function () {
    const pid = ethers.id("payment-1");
    await registry.connect(rater1).submitRating(provider.address, 5, pid);
    const [total, count, avg] = await registry.getReputation(provider.address);
    expect(total).to.equal(5n);
    expect(count).to.equal(1n);
    expect(avg).to.equal(500n);
  });

  it("computes correct average across multiple ratings", async function () {
    await registry.connect(rater1).submitRating(provider.address, 5, ethers.id("p1"));
    await registry.connect(rater2).submitRating(provider.address, 2, ethers.id("p2"));
    const [total, count, avg] = await registry.getReputation(provider.address);
    expect(total).to.equal(7n);
    expect(count).to.equal(2n);
    expect(avg).to.equal(350n);
  });

  it("reverts on score = 0", async function () {
    await expect(
      registry.connect(rater1).submitRating(provider.address, 0, ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "InvalidScore");
  });

  it("reverts on score = 6", async function () {
    await expect(
      registry.connect(rater1).submitRating(provider.address, 6, ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "InvalidScore");
  });

  it("reverts on self-rating", async function () {
    await expect(
      registry.connect(provider).submitRating(provider.address, 5, ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "SelfRating");
  });

  it("reverts on duplicate rating (same rater, same paymentId)", async function () {
    const pid = ethers.id("p1");
    await registry.connect(rater1).submitRating(provider.address, 5, pid);
    await expect(
      registry.connect(rater1).submitRating(provider.address, 1, pid)
    ).to.be.revertedWithCustomError(registry, "DuplicateRating");
  });

  it("allows two different raters to rate the same paymentId", async function () {
    const pid = ethers.id("p1");
    await registry.connect(rater1).submitRating(provider.address, 5, pid);
    await registry.connect(rater2).submitRating(provider.address, 3, pid);
    const [, count] = await registry.getReputation(provider.address);
    expect(count).to.equal(2n);
  });

  it("reverts on zero address provider", async function () {
    await expect(
      registry.connect(rater1).submitRating(ethers.ZeroAddress, 5, ethers.id("p1"))
    ).to.be.revertedWithCustomError(registry, "ZeroAddress");
  });

  it("returns zeroes for an unrated provider", async function () {
    const [total, count, avg] = await registry.getReputation(rater2.address);
    expect(total).to.equal(0n);
    expect(count).to.equal(0n);
    expect(avg).to.equal(0n);
  });

  it("hasRated reflects state accurately", async function () {
    const pid = ethers.id("p1");
    expect(await registry.hasRated(rater1.address, provider.address, pid)).to.equal(false);
    await registry.connect(rater1).submitRating(provider.address, 4, pid);
    expect(await registry.hasRated(rater1.address, provider.address, pid)).to.equal(true);
    expect(await registry.hasRated(rater2.address, provider.address, pid)).to.equal(false);
  });

  it("emits RatingSubmitted with correct args", async function () {
    const pid = ethers.id("p1");
    await expect(registry.connect(rater1).submitRating(provider.address, 5, pid))
      .to.emit(registry, "RatingSubmitted")
      .withArgs(provider.address, rater1.address, 5, pid, 5n, 1n);
  });

  it("average always in [100,500] range across 10 ratings", async function () {
    const signers = await ethers.getSigners();
    const pool = signers.slice(4, 14);
    for (let i = 0; i < pool.length; i++) {
      const score = (i % 5) + 1;
      await registry.connect(pool[i]).submitRating(provider.address, score, ethers.id(`p${i}`));
    }
    const [,, avg] = await registry.getReputation(provider.address);
    expect(avg).to.be.at.least(100n);
    expect(avg).to.be.at.most(500n);
  });
});
