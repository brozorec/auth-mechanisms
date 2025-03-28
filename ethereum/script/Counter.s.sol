// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console, VmSafe} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";
import {Delegate} from "../src/Delegate.sol";

contract CounterScript is Script {
    Counter public counter;

    address owner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    uint256 ownerPk = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    function setUp() public {}

    function run() public {
        vm.startBroadcast(ownerPk);

        counter = new Counter(owner);
        counter.increment();

        vm.stopBroadcast();
        VmSafe.BroadcastTxSummary memory summary = vm.getBroadcast("Counter", 0x7a69, VmSafe.BroadcastTxType.Call);
        console.logBytes32(summary.txHash);
    }
}

contract CounterWithSponsoring is Script {
    Counter public counter;
    Delegate public delegate;

    address owner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    uint256 ownerPk = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 senderPk = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;

    function setUp() public {}

    function run() public {
        vm.startBroadcast(senderPk);

        delegate = new Delegate();
        counter = new Counter(owner);
        vm.signAndAttachDelegation(address(delegate), ownerPk);
        address(0).call("");

        Delegate.Call[] memory calls = new Delegate.Call[](1);
        calls[0] = Delegate.Call({data: abi.encodeWithSignature("increment()"), to: address(counter), value: 0});
        Delegate(payable(owner)).execute(calls);

        vm.stopBroadcast();
        //VmSafe.BroadcastTxSummary memory summary = vm.getBroadcast("Counter", 0x7a69, VmSafe.BroadcastTxType.Call);
        //console.logBytes32(summary.txHash);

        //VmSafe.SignedDelegation memory delegation = vm.signAndAttachDelegation(address(delegate), ownerPk);
    }
}
