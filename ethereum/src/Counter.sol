// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    address public owner;
    uint256 public counter;

    constructor(address _owner) {
        owner = _owner;
    }

    function increment() public {
        //require(owner == tx.origin, "not an owner");
        require(owner == msg.sender, "not an owner");
        counter++;
    }
}
