import { Keypair, Operation, Transaction } from "@stellar/stellar-sdk";

import {
  signAuths,
  saveTxData,
  buildAndPrepareTx,
  submitTx,
  deployContract,
  addrToScVal,
  signInvocation,
  readContractAddr,
} from "./helpers.js";
import { alice, bob, charlie } from "./keypairs.js";

// Simple invocation: one signer who is also the invoker
// Alice is owner and invoker
async function callCounter(contract) {
  const operation = Operation.invokeContractFunction({
    function: "increment",
    args: [],
    contract,
  });

  const tx = await buildAndPrepareTx(alice, operation);

  tx.sign(alice);
  saveTxData(tx, "counter");

  console.log("submitting tx callCounter ..");
  return await submitTx(tx);
}

// Simple invocation: one signer and different invoker
// Alice is owner
// Bob is invoker
async function callCounterSponsored(contract) {
  const operation = Operation.invokeContractFunction({
    function: "increment",
    args: [],
    contract,
  });

  const tx = await buildAndPrepareTx(bob, operation);

  // Alice signs only the auth entry
  tx.operations[0].auth = await signAuths([alice], tx.operations[0].auth);

  // then Bob signs the tx and sends it (pays for it)
  tx.sign(bob);
  saveTxData(tx, "counter-sponsored");

  console.log("submitting tx callCounterSponsored ...");
  return await submitTx(tx);
}

// Simple invocation: two signers and different invoker
// Alice is owner1
// Bob is owner2
// Charlie is invoker
async function callMulti(contract) {
  const operation = Operation.invokeContractFunction({
    function: "increment",
    args: [],
    contract,
  });

  const tx = await buildAndPrepareTx(charlie, operation);

  // Alice signs only the auth entry
  tx.operations[0].auth = await signAuths([alice, bob], tx.operations[0].auth);

  // then Charlie signs the tx and sends it (pays for it)
  tx.sign(charlie);
  saveTxData(tx, "multi");

  console.log("submitting tx callMulti ...");
  return await submitTx(tx);
}

// Simple invocation: one signer and different invoker
// Alice is owner
// Bob is invoker
async function callWrapper(contract, nestedContract) {
  // Alice signs a separate invocation
  const incrementInvocation = await signInvocation(
    alice,
    nestedContract,
    "increment",
    [],
  );

  const operation = Operation.invokeContractFunction({
    function: "cross_call_increment",
    args: [addrToScVal(nestedContract)],
    contract,
    auth: [incrementInvocation],
  });

  const tx = await buildAndPrepareTx(bob, operation);

  // then Bob signs the tx and sends it (pays for it)
  tx.sign(bob);
  saveTxData(tx, "wrapper");

  console.log("submitting tx callWrapper ...");
  return await submitTx(tx);
}

try {
  const counter = readContractAddr("counter");
  await callCounter(counter);
  await callCounterSponsored(counter);

  const multi = readContractAddr("multi");
  await callMulti(multi);

  const wrapper = readContractAddr("wrapper");
  await callWrapper(wrapper, counter);
} catch (error) {
  console.error(error);
}
