import fs from "fs";
import { decode, initSync } from "@stellar/stellar-xdr-json";

import {
  Address,
  authorizeEntry,
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  StrKey,
  authorizeInvocation,
  xdr,
} from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";

// Initialize the RPC server (testnet)
const server = new Server("https://soroban-testnet.stellar.org:443");

export function addrToScVal(addr) {
  return Address.fromString(addr).toScVal();
}

export function txToJson(transaction) {
  try {
    const xdrString = transaction.toXDR("base64");
    const wasm = fs.readFileSync(
      import.meta.dirname +
        "/node_modules/@stellar/stellar-xdr-json/stellar_xdr_json_bg.wasm",
    );
    initSync(wasm);

    const decoded = decode("TransactionEnvelope", xdrString);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding XDR:", error);
    throw error;
  }
}

export function saveTxData(transaction, name) {
  const data = txToJson(transaction).tx;
  const trimmed = {
    source_account: data.tx.source_account,
    operations: data.tx.operations,
    signatures: data.signatures,
  };
  fs.writeFileSync(
    `${import.meta.dirname}/${name}.json`,
    JSON.stringify(trimmed, null, 2),
  );
  console.log(`saved tx fields: ${name}.json`);
}

export function saveContractAddr(addr, name) {
  fs.writeFileSync(`${import.meta.dirname}/.${name}_addr`, addr);
  console.log(`saved contract address ${addr} for ${name}`);
}

export function readContractAddr(name) {
    return fs.readFileSync(`${import.meta.dirname}/.${name}_addr`, "utf8");
}

export async function submitTx(transaction) {
  const response = await server.sendTransaction(transaction);

  // Wait for confirmation
  let txResponse;
  while (true) {
    txResponse = await server.getTransaction(response.hash);
    if (txResponse.status !== "NOT_FOUND") {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return txResponse;
}

export async function buildTx(invokerKeypair, operation) {
  const invoker = await server.getAccount(invokerKeypair.publicKey());
  return new TransactionBuilder(invoker, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
}

export async function prepareTx(tx) {
  return await server.prepareTransaction(tx);
}

export async function simulateTx(tx) {
  return await server.simulateTransaction(tx);
}

export async function buildAndPrepareTx(invokerKeypair, operation) {
  const invoker = await server.getAccount(invokerKeypair.publicKey());
  const tx = await buildTx(invokerKeypair, operation);

  return await server.prepareTransaction(tx);
}

export async function buildAndSimulateTx(invokerKeypair, operation) {
  const invoker = await server.getAccount(invokerKeypair.publicKey());
  const tx = await buildTx(invokerKeypair, operation);

  return await server.simulateTransaction(tx);
}

export async function deployContract(filePath, constructorArgs, sourceKeypair) {
  const bytecode = fs.readFileSync(filePath);

  const account = await server.getAccount(sourceKeypair.publicKey());

  const uploadTx = await buildAndPrepareTx(
    sourceKeypair,
    Operation.uploadContractWasm({ wasm: bytecode }),
  );
  uploadTx.sign(sourceKeypair);

  console.log(`uploading ${filePath.split("/").pop()} ...`);
  const uploadResponse = await submitTx(uploadTx);

  const operation = Operation.createCustomContract({
    wasmHash: uploadResponse.returnValue.bytes(),
    address: Address.fromString(sourceKeypair.publicKey()),
    constructorArgs,
    salt: uploadResponse.hash,
  });

  const deployTx = await buildAndPrepareTx(sourceKeypair, operation);
  deployTx.sign(sourceKeypair);
  console.log("deploying contract ...");
  const deployResponse = await submitTx(deployTx);

  const contractAddress = StrKey.encodeContract(
    Address.fromScAddress(deployResponse.returnValue.address()).toBuffer(),
  );
  console.log("contract deployed: " + contractAddress);

  return contractAddress;
}

export async function signAuths(signers, auths) {
  const { sequence } = await server.getLatestLedger();

  for (let i = 0; i < auths.length; i++) {
    auths[i] = await authorizeEntry(
      auths[i],
      signers[i],
      sequence + 12,
      Networks.TESTNET,
    );
  }

  return auths;
}

// -> SorobanAuthorizedInvocation
export function buildInvocation(contract, functionName, subInvocations) {
  let contractAddress = new Address(contract);
  contractAddress = contractAddress.toScAddress();

  let args = new xdr.InvokeContractArgs({
    contractAddress,
    functionName,
    args: [],
  });
  let func =
    xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(args);
  return new xdr.SorobanAuthorizedInvocation({
    function: func,
    subInvocations,
  });
}

// -> SorobanAuthorizationEntry
export async function signInvocation(
  signer,
  contract,
  functionName,
  subInvocations,
) {
  const { sequence } = await server.getLatestLedger();

  const invocation = buildInvocation(contract, functionName, subInvocations);

  return await authorizeInvocation(
    signer,
    sequence + 12,
    invocation,
    signer.publicKey(),
    Networks.TESTNET,
  );
}
