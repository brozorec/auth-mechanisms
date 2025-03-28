// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Delegate {
    struct Call {
        bytes data;
        address to;
        uint256 value;

    }

    error Unauthorized();
    error ExternalCallFailed();

    event Executed(address indexed to, uint256 value, bytes data);

    function execute(Call[] memory calls) public payable {
        //require(msg.sender == address(this), Unauthorized());

        for (uint256 i = 0; i < calls.length; i++) {
            Call memory call = calls[i];

            (bool success,) = call.to.call{value: call.value}(call.data);
            require(success, ExternalCallFailed());

            emit Executed(call.to, call.value, call.data);

        }

    }

    receive() external payable {}
}
