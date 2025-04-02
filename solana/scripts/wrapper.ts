import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { Wrapper } from "../target/types/wrapper";

import { getPubKeys, connection, log } from "./helpers";

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const counterProgram = anchor.workspace.Counter as Program<Counter>;
  const wrapperProgram = anchor.workspace.Wrapper as Program<Wrapper>;

  const { owner, sponsor } = await getPubKeys();

  const seeds = [];
  const [counterStorage, _bump] = web3.PublicKey.findProgramAddressSync(
    seeds,
    counterProgram.programId
  );

  const transaction = new web3.Transaction().add(
    wrapperProgram.instruction.crossCallIncrement({
      accounts: {
        counter: counterProgram.programId, 
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

  const tx = await connection.sendRawTransaction(
    transaction.serialize()
  );
  console.log("Transaction signature:", tx);
  await log(tx, "wrapper");
  // Fetch the counter account data
  const counterAccount = await wrapperProgram.account.counterStorage.fetch(counterStorage);
  console.log("Counter value:", counterAccount.count.toString());
})();
