import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";

const connection = new web3.Connection("http://127.0.0.1:8899", {
  commitment: "confirmed",
});

it("runs", async () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Counter as Program<Counter>;
  const invokerKeypair = web3.Keypair.generate();

  const tx = await program.methods
    .initialize(program.provider.publicKey)
    .accounts({ user: program.provider.publicKey })
    .signers([invokerKeypair])
    .rpc();

  console.log("The owner: ", program.provider.publicKey.toBase58());

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { transaction } = await connection.getTransaction(tx);
  console.log(transaction);
});

