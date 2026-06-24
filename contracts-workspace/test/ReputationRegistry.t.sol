// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ReputationRegistry} from "../contracts/ReputationRegistry.sol";

contract ReputationRegistryTest is Test {
    ReputationRegistry registry;
    address provider = address(0xA11CE);
    address rater1   = address(0xB0B1);
    address rater2   = address(0xB0B2);

    function setUp() public { registry = new ReputationRegistry(); }

    function test_SubmitRating_StoresCorrectly() public {
        bytes32 pid = keccak256("payment-1");
        vm.prank(rater1);
        registry.submitRating(provider, 5, pid);
        (uint256 total, uint256 count, uint256 avg) = registry.getReputation(provider);
        assertEq(total, 5); assertEq(count, 1); assertEq(avg, 500);
    }

    function test_AverageAcrossMultipleRatings() public {
        vm.prank(rater1); registry.submitRating(provider, 5, keccak256("p1"));
        vm.prank(rater2); registry.submitRating(provider, 2, keccak256("p2"));
        (,, uint256 avg) = registry.getReputation(provider);
        assertEq(avg, 350);
    }

    function test_RevertOnScoreZero() public {
        vm.prank(rater1);
        vm.expectRevert(abi.encodeWithSelector(ReputationRegistry.InvalidScore.selector, 0));
        registry.submitRating(provider, 0, keccak256("p1"));
    }

    function test_RevertOnScoreSix() public {
        vm.prank(rater1);
        vm.expectRevert(abi.encodeWithSelector(ReputationRegistry.InvalidScore.selector, 6));
        registry.submitRating(provider, 6, keccak256("p1"));
    }

    function test_RevertOnSelfRating() public {
        vm.prank(provider);
        vm.expectRevert(ReputationRegistry.SelfRating.selector);
        registry.submitRating(provider, 5, keccak256("p1"));
    }

    function test_RevertOnDuplicateRating() public {
        bytes32 pid = keccak256("p1");
        vm.prank(rater1); registry.submitRating(provider, 5, pid);
        vm.prank(rater1);
        vm.expectRevert(abi.encodeWithSelector(ReputationRegistry.DuplicateRating.selector, pid));
        registry.submitRating(provider, 1, pid);
    }

    function test_AllowsDifferentRatersSamePayment() public {
        bytes32 pid = keccak256("p1");
        vm.prank(rater1); registry.submitRating(provider, 5, pid);
        vm.prank(rater2); registry.submitRating(provider, 3, pid);
        (, uint256 count,) = registry.getReputation(provider);
        assertEq(count, 2);
    }

    function test_RevertOnZeroAddress() public {
        vm.prank(rater1);
        vm.expectRevert(ReputationRegistry.ZeroAddress.selector);
        registry.submitRating(address(0), 5, keccak256("p1"));
    }

    function test_UnratedProviderReturnsZeroes() public view {
        (uint256 t, uint256 c, uint256 a) = registry.getReputation(address(0xDEAD));
        assertEq(t, 0); assertEq(c, 0); assertEq(a, 0);
    }

    function test_HasRatedReflectsState() public {
        bytes32 pid = keccak256("p1");
        assertFalse(registry.hasRated(rater1, provider, pid));
        vm.prank(rater1); registry.submitRating(provider, 4, pid);
        assertTrue(registry.hasRated(rater1, provider, pid));
        assertFalse(registry.hasRated(rater2, provider, pid));
    }

    function test_EmitsEvent() public {
        bytes32 pid = keccak256("p1");
        vm.expectEmit(true, true, true, true);
        emit ReputationRegistry.RatingSubmitted(provider, rater1, 5, pid, 5, 1);
        vm.prank(rater1); registry.submitRating(provider, 5, pid);
    }

    function test_AverageInvariant() public {
        vm.prank(rater1); registry.submitRating(provider, 3, keccak256("p1"));
        vm.prank(rater2); registry.submitRating(provider, 4, keccak256("p2"));
        (,, uint256 avg) = registry.getReputation(provider);
        assertGe(avg, 100); assertLe(avg, 500);
    }

    function testFuzz_AverageAlwaysInBounds(uint8 score, uint8 n) public {
        score = uint8(bound(score, 1, 5));
        n = uint8(bound(n, 1, 20));
        for (uint8 i = 0; i < n; i++) {
            address r = address(uint160(uint256(keccak256(abi.encodePacked(i)))));
            vm.prank(r);
            registry.submitRating(provider, score, keccak256(abi.encodePacked("p", i)));
        }
        (,, uint256 avg) = registry.getReputation(provider);
        assertGe(avg, 100); assertLe(avg, 500);
    }
}
