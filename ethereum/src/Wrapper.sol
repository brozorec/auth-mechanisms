// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Counter} from "./Counter.sol";

contract Wrapper {
    function crossCallIncrement(address counter) public {
        // will fail
        Counter(counter).increment();
    }
}
