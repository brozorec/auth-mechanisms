// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";


contract CounterTest is Test {
    address alice = makeAddr("alice");

    Counter public counterContract;

    function setUp() public {
        counterContract = new Counter(alice);
    }

    function test_Increment() public {
        vm.prank(alice);
        counterContract.increment();
        assertEq(counterContract.counter(), 1);
    }
}
