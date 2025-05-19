# 🔐 Transaction Structure and Authorization Mechanisms

**A comparative study of Ethereum, Stellar Soroban and Solana**

__This repository contains the companion code for the [Who Can Sign What: How Blockchains Handle Authorization](https://brozorec.github.io/post/auth-mechanisms/).__

## Overview

This repository accompanies an article exploring how **Ethereum**, **Stellar Soroban** and **Solana** handle authorization, fee sponsorship, and cross-contract interactions.

The goal is to understand **who can sign**, **what they authorize**, and **how transaction structure** affects developer and user experience.
Rather than focusing on smart contract code, we look at the **transaction data itself**, and what it reveals about the design of each ecosystem.

We compare how the same contract logic is implemented and executed across different blockchains and how the transaction data reflects each ecosystem’s authorization model.

## Contracts

Each of the three subfolders (`/ethereum/`, `/stellar/`, `/solana/`) contains **two similar contracts**:

- `Counter` contract: only an assigned owner can call the `increment()` function.
- `Wrapper` contract: wraps a call to `Counter.increment()` and demonstrates cross-contract interaction.

In each folder, you’ll also find:
- Deployment and execution scripts
- Utilities to capture and save transaction output, so you can inspect the raw structure and understand what’s happening under the hood

## How to Use This Repo

1. Clone the repo:
   ```bash
   git clone https://github.com/brozorec/authorization-mechanisms.git
   ```
2. Navigate to each chain’s subfolder and follow the README in each directory to deploy and run the examples.
