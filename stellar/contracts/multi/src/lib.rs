#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

pub const OWNER_1: Symbol = symbol_short!("OWNER_1");
pub const OWNER_2: Symbol = symbol_short!("OWNER_2");
pub const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct MultiContract;

#[contractimpl]
impl MultiContract {
    pub fn __constructor(e: &Env, owner_1: Address, owner_2: Address) {
        e.storage().instance().set(&OWNER_1, &owner_1);
        e.storage().instance().set(&OWNER_2, &owner_2);
    }

    pub fn increment(e: &Env) {
        let owner_1: Address = e
            .storage()
            .instance()
            .get(&OWNER_1)
            .expect("owner must be set");
        // check `owner_1` has signed
        owner_1.require_auth();

        let owner_2: Address = e
            .storage()
            .instance()
            .get(&OWNER_2)
            .expect("owner must be set");
        // check `owner_1` has signed
        owner_2.require_auth();

        let mut counter: u32 = e.storage().instance().get(&COUNTER).unwrap_or_default();
        counter += 1;
        e.storage().instance().set(&COUNTER, &counter);
    }

    pub fn get_counter(e: &Env) -> u32 {
        e.storage().instance().get(&COUNTER).unwrap_or_default()
    }
}
