use anchor_lang::prelude::*;

use counter::{cpi::accounts::Increment, program::Counter, CounterStorage};

declare_id!("DkqBrRHr1jcTMmg4qRgTdBcWszJPRyXrbGaPzTCXYkrN");

#[program]
pub mod wrapper {

    use super::*;

    pub fn cross_call(ctx: Context<CounterOp>) -> Result<()> {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.counter.to_account_info(),
            Increment {
                counter_storage: ctx.accounts.counter_storage.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );

        counter::cpi::increment(cpi_ctx)
    }
}

#[error_code]
pub enum Errors {
    #[msg("cpi to counter failed")]
    CPIToCounterFailed,
}

#[derive(Accounts)]
pub struct CounterOp<'info> {
    pub counter: Program<'info, Counter>,
    #[account(mut)]
    pub counter_storage: Account<'info, CounterStorage>,
    pub authority: Signer<'info>,
}
