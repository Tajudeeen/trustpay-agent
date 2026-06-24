// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReputationRegistry
/// @notice Stores cumulative reputation for x402 payment providers on Arc.
/// @dev Average is computed on read (totalScore / ratingCount) — never stored —
///      to prevent rounding drift. Access control: rating is tied to a unique
///      paymentId so the same payment cannot be rated twice by the same rater.
contract ReputationRegistry {
    struct Reputation {
        uint256 totalScore;
        uint256 ratingCount;
    }

    mapping(address => Reputation) private reputations;
    mapping(bytes32 => bool) private ratingSubmitted;

    event RatingSubmitted(
        address indexed provider,
        address indexed rater,
        uint8 score,
        bytes32 indexed paymentId,
        uint256 newTotalScore,
        uint256 newRatingCount
    );

    error InvalidScore(uint8 score);
    error SelfRating();
    error DuplicateRating(bytes32 paymentId);
    error ZeroAddress();

    function submitRating(address provider, uint8 score, bytes32 paymentId) external {
        if (provider == address(0)) revert ZeroAddress();
        if (score < 1 || score > 5) revert InvalidScore(score);
        if (msg.sender == provider) revert SelfRating();
        bytes32 key = keccak256(abi.encodePacked(msg.sender, provider, paymentId));
        if (ratingSubmitted[key]) revert DuplicateRating(paymentId);
        ratingSubmitted[key] = true;
        reputations[provider].totalScore += score;
        reputations[provider].ratingCount += 1;
        emit RatingSubmitted(provider, msg.sender, score, paymentId,
            reputations[provider].totalScore, reputations[provider].ratingCount);
    }

    /// @return totalScore Total score sum
    /// @return ratingCount Number of ratings
    /// @return averageScoreScaled Average x100 (370 = 3.70)
    function getReputation(address provider)
        external view
        returns (uint256 totalScore, uint256 ratingCount, uint256 averageScoreScaled)
    {
        Reputation storage r = reputations[provider];
        totalScore = r.totalScore;
        ratingCount = r.ratingCount;
        averageScoreScaled = ratingCount == 0 ? 0 : (totalScore * 100) / ratingCount;
    }

    function hasRated(address rater, address provider, bytes32 paymentId) external view returns (bool) {
        return ratingSubmitted[keccak256(abi.encodePacked(rater, provider, paymentId))];
    }
}
