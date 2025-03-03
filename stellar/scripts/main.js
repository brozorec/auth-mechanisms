import { Keypair, Operation } from "@stellar/stellar-sdk";

import {
  signAuths,
  saveTxData,
  buildAndPrepareTx,
  submitTx,
  deployContract,
  addrToScVal,
} from "./helpers.js";

const alice = Keypair.fromSecret(
  "SBGOY5ZZTXHUQWLD6D7GTPT4WAFOWL7N2TWBXGHQFLLKU4MM7SFDIXFD",
);
const bob = Keypair.fromSecret(
  "SAVM62QKEY4EWD4MI5QP7SCIRCDTWXHJT6QPFNSHYSTRM6VCGGCGYIRX",
);
const charlie = Keypair.fromSecret(
  "SBE2B7CMIPC5HD5JQJ2YKUMOKZGDODAJR4GN6YCTL3CJEYA4SJ5KEJX4",
);

// Simple invocation: one signer who is also the invoker
// Alice is owner and invoker
async function caseA(contract) {
  const operation = Operation.invokeContractFunction({
    function: "increment",
    args: [],
    contract,
  });

  const tx = await buildAndPrepareTx(alice, operation);

  tx.sign(alice);
  saveTxData(tx, "single-signer-same-invoker-simple-call");

  console.log("submitting tx caseA ..");
  //return await submitTx(tx)
}

// Simple invocation: one signer and different invoker
// Alice is owner
// Bob is invoker
async function caseB(contract) {
  const operation = Operation.invokeContractFunction({
    function: "increment",
    args: [],
    contract,
  });

  const tx = await buildAndPrepareTx(bob, operation);

  // Alice signs only the auth entry
  tx.operations[0].auth = signAuths([alice], tx.operations[0].auth);

  // then Bob signs the tx and sends it (pays for it)
  tx.sign(bob);
  saveTxData(tx, "single-signer-diff-invoker-simple-call");

  console.log("submitting tx caseB ...");
  return await submitTx(tx)
}

// Simple invocation: two signers and different invoker
// Alice is owner1
// Bob is owner2
// Charlie is invoker
async function caseC(contract) {
  const operation = Operation.invokeContractFunction({
    function: "increment",
    args: [],
    contract,
  });

  const tx = await buildAndPrepareTx(charlie, operation);

  // Alice signs only the auth entry
  tx.operations[0].auth = signAuths([alice, bob], tx.operations[0].auth);

  // then Charlie signs the tx and sends it (pays for it)
  tx.sign(charlie);
  saveTxData(tx, "multi-signers-diff-invoker-simple-call");

  console.log("submitting tx caseC ...");
  return await submitTx(tx)
}

// Simple invocation: one signer and different invoker
// Alice is owner
// Bob is invoker
async function caseD(contract, nestedContract) {
  const operation = Operation.invokeContractFunction({
    function: "cross_call_increment",
    args: [addrToScVal(nestedContract)],
    contract,
  });

  const tx = await buildAndPrepareTx(bob, operation);

  // Alice signs only the auth entry
  tx.operations[0].auth = signAuths([alice], tx.operations[0].auth);

  // then Bob signs the tx and sends it (pays for it)
  tx.sign(bob);
  saveTxData(tx, "single-signer-diff-invoker-cross-call");

  console.log("submitting tx caseD ...");
  return await submitTx(tx);
}

const singleOwner =
"CBOAM3OHMAVHYSVMS2UDZOJJGEJVNFK3TDTM3M3DLGF76OTYDGISFD3B";
const multiOwners =
"CBH63FWALGB6WIJUYQMRKXUVPU27FOXKTDVUMBCBOXCLUC7NDFDAQDZS";
const crossCall =
"CB5WAFKK2FOXWU4MWEC456MVUH4LZK6U2FYOQRMU3DBTTQXLMD5TWDZL";

try {
  //const singleOwner = await deployContract(
    //`${import.meta.dirname}/../target/wasm32-unknown-unknown/release/single_owner.wasm`,
    //[addrToScVal(alice.publicKey())],
    //alice,
  //);
  await caseA(singleOwner);
  //await caseB(singleOwner);

  //const multiOwners = await deployContract(
    //`${import.meta.dirname}/../target/wasm32-unknown-unknown/release/multi_owners.wasm`,
    //[addrToScVal(alice.publicKey()), addrToScVal(bob.publicKey())],
    //alice,
  //);
  //await caseC(multiOwners);

  //const crossCall = await deployContract(
    //`${import.meta.dirname}/../target/wasm32-unknown-unknown/release/cross_call.wasm`,
    //[],
    //alice,
  //);
  //await caseD(crossCall, singleOwner);
} catch (error) {
  console.error(error);
}
