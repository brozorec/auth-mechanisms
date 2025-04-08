#![no_std]
//use single_owner::CounterClient;
use soroban_sdk::{contract, contractclient, contractimpl, Address, Env};

#[contractclient(name = "CounterClient")]
pub trait Counter {
    fn increment(e: &Env);

    fn get_owner(e: &Env) -> Address;
}

#[contract]
pub struct WrapperAuthContract;

#[contractimpl]
impl WrapperAuthContract {
    pub fn cross_call_increment(e: &Env, nested_contract: Address) {
        let client = CounterClient::new(e, &nested_contract);

        // this line is the only difference with `Wrapper`
        client.get_owner().require_auth();

        client.increment();
    }
}
