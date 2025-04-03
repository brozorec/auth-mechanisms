import { Keypair, Operation, Transaction } from "@stellar/stellar-sdk";

import {
    signAuths,
    saveTxData,
    buildAndPrepareTx,
    submitTx,
    deployContract,
    addrToScVal,
    signInvocation,
} from "./helpers.js";

// GBDZXYMJ3SLYXCZ3IY5AY32FGIT6KQB3VHG3DX5UYSURLZTP4WSANAPC
const alice = Keypair.fromSecret(
    "SBGOY5ZZTXHUQWLD6D7GTPT4WAFOWL7N2TWBXGHQFLLKU4MM7SFDIXFD",
);
// GC27EIWNDNLD2HO5PGJU3P7M66SCT3PSD2IH4FXZYKCSY3TTMAJND6MA
const bob = Keypair.fromSecret(
    "SAVM62QKEY4EWD4MI5QP7SCIRCDTWXHJT6QPFNSHYSTRM6VCGGCGYIRX",
);
// GCMQMWOWPQTGMXMMVRTGTCHQR5RSKUOM2SDSRB7E3RMVMHEBA3TB6V7M
const charlie = Keypair.fromSecret(
    "SBE2B7CMIPC5HD5JQJ2YKUMOKZGDODAJR4GN6YCTL3CJEYA4SJ5KEJX4",
);

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
    return await submitTx(tx)
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

const counter = "CDYW676XIE5OPWRNRAY7Y2JEZJRVFKNWGPQTLOEYKPJAIPKLE4X725YK";
const multi = "CBG2XMEQB2FUVRRCCAQDAPYHLPANREP6YMTCSF6ZSYLJLIBAGEZAMPFX";
const wrapper = "CAHJRPRPOHLXEM7JEFIJG3B2BZSPLVJNJG6TBI7ZSNP7IAFEXXROXD53";

try {
    //const counter = await deployContract(
    //`${import.meta.dirname}/../target/wasm32-unknown-unknown/release/counter.wasm`,
    //[addrToScVal(alice.publicKey())],
    //alice,
    //);
    await callCounter(counter);
    await callCounterSponsored(counter);

    //const multi = await deployContract(
    //`${import.meta.dirname}/../target/wasm32-unknown-unknown/release/multi.wasm`,
    //[addrToScVal(alice.publicKey()), addrToScVal(bob.publicKey())],
    //alice,
    //);
    await callMulti(multi);

    //const wrapper = await deployContract(
    //`${import.meta.dirname}/../target/wasm32-unknown-unknown/release/wrapper.wasm`,
    //[],
    //alice,
    //);
    await callWrapper(wrapper, counter);
} catch (error) {
    console.error(error);
}
