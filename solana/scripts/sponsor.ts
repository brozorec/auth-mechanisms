import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { getPubKeys, connection, log } from "./helpers";

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;

  const { owner, sponsor } = await getPubKeys();

  const seeds = [];
  const [counterStorage, _bump] = web3.PublicKey.findProgramAddressSync(
    seeds,
    program.programId
  );

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
  transaction.feePayer = sponsor.publicKey;

  transaction.partialSign(owner);

  transaction.partialSign(sponsor);

  const tx = await connection.sendRawTransaction(transaction.serialize());
  console.log("Transaction signature:", tx);
  await log(tx, "counter-sponsored");

  // Fetch the counter account data
  const counterAccount = await program.account.counterStorage.fetch(
    counterStorage
  );
  console.log("Counter value:", counterAccount.count.toString());
})();
