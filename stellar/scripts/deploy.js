import {
  deployContract,
  addrToScVal,
  saveContractAddr,
  readContractAddr,
} from "./helpers.js";
import { alice, bob, charlie } from "./keypairs.js";

try {
  const counter = await deployContract(
    `${import.meta.dirname}/../target/wasm32-unknown-unknown/release/counter.wasm`,
    [addrToScVal(alice.publicKey())],
    alice,
  );
  saveContractAddr(counter, "counter");

  const multi = await deployContract(
    `${import.meta.dirname}/../target/wasm32-unknown-unknown/release/multi.wasm`,
    [addrToScVal(alice.publicKey()), addrToScVal(bob.publicKey())],
    alice,
  );
  saveContractAddr(multi, "multi");

  const wrapper = await deployContract(
    `${import.meta.dirname}/../target/wasm32-unknown-unknown/release/wrapper.wasm`,
    [],
    alice,
  );
  saveContractAddr(wrapper, "wrapper");
} catch (error) {
  console.error(error);
}
