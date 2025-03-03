// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console, VmSafe} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract CounterScript is Script {
    Counter public counter;

    address alice = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    uint256 alicePk = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    function setUp() public {}

    function run() public {
        vm.startBroadcast(alicePk);

        counter = new Counter(alice);
        counter.increment();

        vm.stopBroadcast();
        VmSafe.BroadcastTxSummary memory summary = vm.getBroadcast("Counter", 0x7a69, VmSafe.BroadcastTxType.Call);
        console.logBytes32(summary.txHash);
    }
}
