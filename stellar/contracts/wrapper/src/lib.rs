#![no_std]
//use single_owner::CounterClient;
use soroban_sdk::{contract, contractclient, contractimpl, Address, Env};

#[contractclient(name = "CounterClient")]
pub trait Counter {
    fn increment(e: &Env);

    //fn get_counter(e: &Env) -> u32;

    //fn get_owner(e: &Env) -> Address;
}

#[contract]
pub struct WrapperContract;

#[contractimpl]
impl WrapperContract {
    pub fn cross_call_increment(e: &Env, nested_contract: Address) {
        let client = CounterClient::new(e, &nested_contract);
        client.increment();
    }
}
