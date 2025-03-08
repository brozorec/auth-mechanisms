use anchor_lang::prelude::*;
use std::mem::size_of;

declare_id!("EFwWPJo81YAC4awPFfmqeX8geh8upUvvsJzU5teM63Xf");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, owner: Pubkey) -> Result<()> {
        let counter_storage = &mut ctx.accounts.counter_storage;
        counter_storage.owner = owner;
        counter_storage.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter_storage = &mut ctx.accounts.counter_storage;
        require!(
            counter_storage.owner == *ctx.accounts.authority.key,
            ProgramError::OwnerError
        );
        counter_storage.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = size_of::<CounterStorage>() + 8, seeds = [], bump)]
    pub counter_storage: Account<'info, CounterStorage>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter_storage: Account<'info, CounterStorage>,
    pub authority: Signer<'info>,
}

#[account]
pub struct CounterStorage {
    pub owner: Pubkey,
    pub count: u64,
}

#[error_code]
pub enum ProgramError {
    #[msg("Only the owner can increment the counter.")]
    OwnerError,
}
