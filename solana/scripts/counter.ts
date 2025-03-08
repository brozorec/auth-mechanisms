import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";

import { getPubKeys, connection, log } from "./helpers";

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Counter as Program<Counter>;

  const { owner } = await getPubKeys();

  // Generate a keypair for the counter account
  const seeds = [];
  const [counterStorage, _bump] = web3.PublicKey.findProgramAddressSync(
    seeds,
    program.programId
  );

  console.log("Initializing counter...");
  await program.methods
    .initialize(owner.publicKey)
    .accounts({
      user: owner.publicKey,
    })
    .signers([owner])
    .rpc();

  console.log(`Counter initialized at: ${counterStorage}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Incrementing counter...");
  const transaction = new web3.Transaction().add(
    program.instruction.increment({
      accounts: {
        counterStorage,
        authority: owner.publicKey,
      },
    })
  );

  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = owner.publicKey;

  transaction.partialSign(owner);

  const tx = await connection.sendRawTransaction(transaction.serialize());
  console.log("Transaction signature:", tx);
  await log(tx, "counter");

  const counterAccount = await program.account.counterStorage.fetch(
    counterStorage
  );
  console.log("Counter value:", counterAccount.count.toString());
})();
