// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Counter} from "./Counter.sol";

contract Wrapper {
    function crossCallIncrement(address counter) public {
        //address owner = Counter(counter).owner();
        //require(owner == msg.sender, "not an owner");
        Counter(counter).increment();
    }
}
