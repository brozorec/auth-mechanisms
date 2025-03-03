#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

pub const OWNER: Symbol = symbol_short!("OWNER");
pub const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct SingleOwnerContract;

#[contractimpl]
impl SingleOwnerContract {
    pub fn __constructor(e: Env, owner: Address) {
        e.storage().instance().set(&OWNER, &owner);
    }

    pub fn increment(e: Env) {
        let owner: Address = e
            .storage()
            .instance()
            .get(&OWNER)
            .expect("owner must be set");
        // check `owner` has signed
        owner.require_auth();

        let mut counter: u32 = e.storage().instance().get(&COUNTER).unwrap_or_default();
        counter += 1;
        e.storage().instance().set(&COUNTER, &counter);
    }

    pub fn get_owner(e: Env) -> Address {
        e.storage().instance().get(&OWNER).expect("owner not set")
    }

    pub fn get_counter(e: Env) -> u32 {
        e.storage().instance().get(&COUNTER).unwrap_or_default()
    }
}
