#![no_std]
//use single_owner::SingleOwnerClient;
use soroban_sdk::{contract, contractclient, contractimpl, Address, Env};

#[contractclient(name = "SingleOwnerClient")]
pub trait SingleOwner {
    fn increment(e: &Env);

    //fn get_counter(e: &Env) -> u32;

    fn get_owner(e: &Env) -> Address;
}

#[contract]
pub struct CrossCallContract;

#[contractimpl]
impl CrossCallContract {
    pub fn cross_call_increment(e: &Env, nested_contract: Address) {
        let client = SingleOwnerClient::new(e, &nested_contract);
        client.get_owner().require_auth();
        client.increment();
    }
}
