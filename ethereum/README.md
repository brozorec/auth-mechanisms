## Ethereum

Use [foundry](https://book.getfoundry.sh/) to build and run smart contracts in this subfolder.

1. Make sure foundry is up to date
```shell
foundryup
```
2. Start local anvil node with Odyssey features enabled (required for Pectra-enabled features such as EIP-7702)
```shell
anvil --odyssey
```
3. From another shell session, run the `Counter` example
```shell
bash scripts/counter.sh
```
- You'll find the transaction output saved at `scripts/counter.json`.
4. Run the `Counter` example with fee sponsorship
```shell
bash scripts/counter-sponsored.sh
```
- You'll find the transaction output saved at `scripts/counter-sponsored.json`.

Check [here](https://github.com/ithacaxyz/odyssey-examples/tree/main/chapter1/simple-7702) for a step-by-step walkthrough example with EIP-7702.
