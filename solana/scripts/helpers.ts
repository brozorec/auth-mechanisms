import fs from "fs";
import { web3 } from "@coral-xyz/anchor";

export const connection = new web3.Connection("http://127.0.0.1:8899", {
  commitment: "confirmed",
});

export async function getPubKeys() {
  const scOwner = JSON.parse(fs.readFileSync("owner-keypair.json", "utf8"));
  const owner = web3.Keypair.fromSecretKey(new Uint8Array(scOwner));
  console.log("The owner: ", owner.publicKey.toBase58());

  const scSponsor = JSON.parse(fs.readFileSync("sponsor-keypair.json", "utf8"));
  const sponsor = web3.Keypair.fromSecretKey(new Uint8Array(scSponsor));
  console.log("The sponsor: ", sponsor.publicKey.toBase58());

  await connection.requestAirdrop(owner.publicKey, 1000000000);
  await connection.requestAirdrop(sponsor.publicKey, 1000000000);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { owner, sponsor };
}

export function saveTx(name: string, transaction) {
  fs.writeFileSync(
    `./scripts/${name}.json`,
    JSON.stringify(transaction, null, 2)
  );
}

export async function log(tx, name: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const { transaction } = await connection.getTransaction(tx);

  saveTx(name, transaction);
  console.log(transaction);
  console.log(transaction.message.instructions);
}
