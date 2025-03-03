// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Counter} from "./Counter.sol";

contract Wrapper {
    Counter public counter;

    constructor(Counter _counter) {
        counter = _counter;
    }

    function crossCallIncrement() public {
        address owner = counter.owner();
        require(owner == msg.sender, "not an owner");
        counter.increment();
    }
}
