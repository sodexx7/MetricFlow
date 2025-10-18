from hyperon import MeTTa, E, S, ValueAtom

def initialize_OnChainFinance_knowledge(metta: MeTTa):
    """Initialize the MeTTa knowledge graph with risk profiles and risk_level,expected_return,goal_strategy,on_chain_trading_101,faq for different user, types"""
    
    # Conservative Risk Profile - Lower risk, stable returns
    metta.space().add_atom(E(S("risk_profile"), S("conservative"), S("lending")))
    metta.space().add_atom(E(S("risk_profile"), S("conservative"), S("staking")))
    metta.space().add_atom(E(S("risk_profile"), S("conservative"), S("stablecoin_lp")))
    metta.space().add_atom(E(S("risk_profile"), S("conservative"), S("treasury_management")))
    metta.space().add_atom(E(S("risk_profile"), S("conservative"), S("bridge_staking")))
    
    # Moderate Risk Profile - Balanced risk/reward
    metta.space().add_atom(E(S("risk_profile"), S("moderate"), S("yield_farming")))
    metta.space().add_atom(E(S("risk_profile"), S("moderate"), S("yield_vaults")))
    metta.space().add_atom(E(S("risk_profile"), S("moderate"), S("yield_trading")))
    metta.space().add_atom(E(S("risk_profile"), S("moderate"), S("governance_participation")))
    metta.space().add_atom(E(S("risk_profile"), S("moderate"), S("nft_lending")))
    metta.space().add_atom(E(S("risk_profile"), S("moderate"), S("prediction_markets")))
    
    # Aggressive Risk Profile - High risk, high reward
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("options")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("derivatives")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("perpetuals")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("leveraged_strategies")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("speculative_farming")))
    # todo ??synthetic_assets
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("synthetic_assets"))) 
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("algorithmic_trading")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("cross_chain_arbitrage")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("flash_loan_arbitrage")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("mev_extraction")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("experimental_protocols")))
    # todo ??zero_knowledge_mining
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("zero_knowledge_mining")))
    
    # Investment Types → Risk Levels (On-chain Finance)
    # Low Risk - Stable, predictable returns
    metta.space().add_atom(E(S("risk_level"), S("lending"), ValueAtom("low risk, stable yield from lending protocols")))
    metta.space().add_atom(E(S("risk_level"), S("staking"), ValueAtom("low risk, validator rewards and governance tokens")))
    metta.space().add_atom(E(S("risk_level"), S("stablecoin_lp"), ValueAtom("low risk, minimal impermanent loss")))
    metta.space().add_atom(E(S("risk_level"), S("treasury_management"), ValueAtom("low risk, institutional-grade asset management")))
    # todo  ?bridge_staking
    metta.space().add_atom(E(S("risk_level"), S("bridge_staking"), ValueAtom("low risk, cross-chain infrastructure rewards")))
    
    # Moderate Risk - Balanced exposure
    metta.space().add_atom(E(S("risk_level"), S("yield_farming"), ValueAtom("moderate risk, liquidity provision with token incentives and impermanent loss")))
    metta.space().add_atom(E(S("risk_level"), S("yield_vaults"), ValueAtom("moderate risk, automated strategy execution")))
    metta.space().add_atom(E(S("risk_level"), S("yield_trading"), ValueAtom("moderate risk, trading fixed vs variable yield components and interest rate derivatives")))
    metta.space().add_atom(E(S("risk_level"), S("governance_participation"), ValueAtom("moderate risk, voting and proposal rewards")))
    metta.space().add_atom(E(S("risk_level"), S("nft_lending"), ValueAtom("moderate risk, illiquid collateral exposure")))
    metta.space().add_atom(E(S("risk_level"), S("prediction_markets"), ValueAtom("moderate risk, event outcome speculation")))
    
    # High Risk - Significant volatility and complexity
    metta.space().add_atom(E(S("risk_level"), S("options"), ValueAtom("high risk, premium decay and volatility")))
    metta.space().add_atom(E(S("risk_level"), S("derivatives"), ValueAtom("high risk, leveraged positions")))
    metta.space().add_atom(E(S("risk_level"), S("synthetic_assets"), ValueAtom("high risk, peg maintenance and oracle dependency")))
    metta.space().add_atom(E(S("risk_level"), S("algorithmic_trading"), ValueAtom("high risk, strategy execution and market timing")))
    metta.space().add_atom(E(S("risk_level"), S("cross_chain_arbitrage"), ValueAtom("high risk, bridge security and timing")))
    
    # Very High Risk - Extreme volatility and leverage
    metta.space().add_atom(E(S("risk_level"), S("perpetuals"), ValueAtom("very high risk, funding costs and liquidation")))
    metta.space().add_atom(E(S("risk_level"), S("leveraged_strategies"), ValueAtom("very high risk, amplified losses")))
    metta.space().add_atom(E(S("risk_level"), S("flash_loan_arbitrage"), ValueAtom("very high risk, atomic transaction dependency")))
    metta.space().add_atom(E(S("risk_level"), S("mev_extraction"), ValueAtom("very high risk, competitive and technical complexity")))
    
    # Extreme Risk - Experimental and unproven
    metta.space().add_atom(E(S("risk_level"), S("speculative_farming"), ValueAtom("extreme risk, new protocol exposure")))
    metta.space().add_atom(E(S("risk_level"), S("experimental_protocols"), ValueAtom("extreme risk, unaudited smart contract exposure")))
    metta.space().add_atom(E(S("risk_level"), S("zero_knowledge_mining"), ValueAtom("extreme risk, cutting-edge cryptographic dependency")))
    
    # Investment Types → Expected Returns
    # Low Risk - Stable returns
    metta.space().add_atom(E(S("expected_return"), S("lending"), ValueAtom("2-8% annually")))
    metta.space().add_atom(E(S("expected_return"), S("staking"), ValueAtom("3-12% annually")))
    metta.space().add_atom(E(S("expected_return"), S("stablecoin_lp"), ValueAtom("3-12% annually")))
    metta.space().add_atom(E(S("expected_return"), S("treasury_management"), ValueAtom("4-10% annually")))
    metta.space().add_atom(E(S("expected_return"), S("bridge_staking"), ValueAtom("5-15% annually")))
    
    # Moderate Risk - Variable returns
    # todo below APY just as the reference
    metta.space().add_atom(E(S("expected_return"), S("yield_farming"), ValueAtom("10-50% annually, highly variable")))
    metta.space().add_atom(E(S("expected_return"), S("yield_vaults"), ValueAtom("8-30% annually")))
    metta.space().add_atom(E(S("expected_return"), S("yield_trading"), ValueAtom("5-40% annually, rate dependent")))
    metta.space().add_atom(E(S("expected_return"), S("governance_participation"), ValueAtom("2-20% annually in tokens")))
    metta.space().add_atom(E(S("expected_return"), S("nft_lending"), ValueAtom("15-80% annually, illiquidity premium")))
    metta.space().add_atom(E(S("expected_return"), S("prediction_markets"), ValueAtom("binary outcomes, 0% or 50-200%")))
    
    # High Risk - Extreme volatility
    metta.space().add_atom(E(S("expected_return"), S("options"), ValueAtom("unlimited gains/losses, premium decay")))
    metta.space().add_atom(E(S("expected_return"), S("derivatives"), ValueAtom("leveraged exposure, -100% to +500%")))
    metta.space().add_atom(E(S("expected_return"), S("synthetic_assets"), ValueAtom("tracking error, peg deviations")))
    metta.space().add_atom(E(S("expected_return"), S("algorithmic_trading"), ValueAtom("strategy dependent, -50% to +300%")))
    metta.space().add_atom(E(S("expected_return"), S("cross_chain_arbitrage"), ValueAtom("spread capture, 5-100% per trade")))
    
    # Very High Risk - Extreme leverage
    metta.space().add_atom(E(S("expected_return"), S("perpetuals"), ValueAtom("leveraged positions, unlimited gains/losses")))
    metta.space().add_atom(E(S("expected_return"), S("leveraged_strategies"), ValueAtom("amplified returns, 2x-20x underlying")))
    metta.space().add_atom(E(S("expected_return"), S("flash_loan_arbitrage"), ValueAtom("atomic profits, 0.1-10% per transaction")))
    metta.space().add_atom(E(S("expected_return"), S("mev_extraction"), ValueAtom("competitive, 0.01-5% per block")))
    
    # Extreme Risk - Experimental
    metta.space().add_atom(E(S("expected_return"), S("speculative_farming"), ValueAtom("extreme volatility, -99% to +1000%")))
    metta.space().add_atom(E(S("expected_return"), S("experimental_protocols"), ValueAtom("unproven, total loss to moon")))
    metta.space().add_atom(E(S("expected_return"), S("zero_knowledge_mining"), ValueAtom("computational rewards, network dependent")))
    
    # Goal → Strategy Mappings (On-chain Finance)
    metta.space().add_atom(E(S("goal_strategy"), S("passive_income"), ValueAtom("lending, staking, stablecoin_lp")))
    metta.space().add_atom(E(S("goal_strategy"), S("speculation"), ValueAtom("options, derivatives, perpetuals")))
    metta.space().add_atom(E(S("goal_strategy"), S("wealth_preservation"), ValueAtom("treasury_management, bridge_staking")))
    metta.space().add_atom(E(S("goal_strategy"), S("yield_maximization"), ValueAtom("yield_farming, yield_vaults")))
    metta.space().add_atom(E(S("goal_strategy"), S("arbitrage_profits"), ValueAtom("cross_chain_arbitrage, flash_loan_arbitrage")))
    metta.space().add_atom(E(S("goal_strategy"), S("governance_influence"), ValueAtom("governance_participation, staking")))
    metta.space().add_atom(E(S("goal_strategy"), S("institutional_treasury"), ValueAtom("treasury_management, yield_vaults")))
    metta.space().add_atom(E(S("goal_strategy"), S("alpha_generation"), ValueAtom("algorithmic_trading, mev_extraction")))
    metta.space().add_atom(E(S("goal_strategy"), S("portfolio_diversification"), ValueAtom("nft_lending, prediction_markets")))
    metta.space().add_atom(E(S("goal_strategy"), S("moonshot_betting"), ValueAtom("speculative_farming, experimental_protocols")))
    metta.space().add_atom(E(S("goal_strategy"), S("stable_yield"), ValueAtom("lending, stablecoin_lp")))
    metta.space().add_atom(E(S("goal_strategy"), S("leveraged_exposure"), ValueAtom("leveraged_strategies, perpetuals")))
    metta.space().add_atom(E(S("goal_strategy"), S("infrastructure_rewards"), ValueAtom("bridge_staking, zero_knowledge_mining")))

    # Specific Strategies → concrete strategis based on the available protocols TODO
    metta.space().add_atom(E(S("specific_strategy"), S("passive_income"), ValueAtom("lending, staking, stablecoin_lp")))
    metta.space().add_atom(E(S("specific_strategy"), S("speculation"), ValueAtom("options, derivatives, perpetuals")))
    metta.space().add_atom(E(S("specific_strategy"), S("wealth_preservation"), ValueAtom("treasury_management, bridge_staking")))
    metta.space().add_atom(E(S("specific_strategy"), S("yield_maximization"), ValueAtom("yield_farming, yield_vaults")))
    metta.space().add_atom(E(S("specific_strategy"), S("arbitrage_profits"), ValueAtom("cross_chain_arbitrage, flash_loan_arbitrage")))
    metta.space().add_atom(E(S("specific_strategy"), S("governance_influence"), ValueAtom("governance_participation, staking")))
    metta.space().add_atom(E(S("specific_strategy"), S("institutional_treasury"), ValueAtom("treasury_management, yield_vaults")))
    metta.space().add_atom(E(S("specific_strategy"), S("alpha_generation"), ValueAtom("algorithmic_trading, mev_extraction")))
    metta.space().add_atom(E(S("specific_strategy"), S("portfolio_diversification"), ValueAtom("nft_lending, prediction_markets")))
    metta.space().add_atom(E(S("specific_strategy"), S("moonshot_betting"), ValueAtom("speculative_farming, experimental_protocols")))
    metta.space().add_atom(E(S("specific_strategy"), S("stable_yield"), ValueAtom("lending, stablecoin_lp")))
    metta.space().add_atom(E(S("specific_strategy"), S("leveraged_exposure"), ValueAtom("leveraged_strategies, perpetuals")))
    metta.space().add_atom(E(S("specific_strategy"), S("infrastructure_rewards"), ValueAtom("bridge_staking, zero_knowledge_mining")))

    
    # On-Chain Trading 101 → Essential Knowledge
    metta.space().add_atom(E(S("on_chain_trading_101"), S("aping_new_protocols"), ValueAtom("avoid rushing into unaudited protocols without research")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("ignoring_impermanent_loss"), ValueAtom("understand IL risk before providing liquidity")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("overleveraging"), ValueAtom("never risk more than you can afford to lose completely")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("gas_fee_miscalculation"), ValueAtom("factor in transaction costs, especially on Ethereum")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("smart_contract_risk"), ValueAtom("verify audits and understand contract risks")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("yield_chasing"), ValueAtom("extremely high APYs often indicate extreme risk")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("lacking_exit_strategy"), ValueAtom("plan how to exit positions before entering")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("cross_chain_bridge_risk"), ValueAtom("bridges are high-value hack targets, use cautiously")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("oracle_manipulation"), ValueAtom("understand price feed dependencies and risks")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("governance_token_speculation"), ValueAtom("governance tokens often have unlimited downside")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("flashloan_attack_exposure"), ValueAtom("understand protocol's flashloan protection mechanisms")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("liquidity_pool_concentration"), ValueAtom("avoid being majority liquidity provider in small pools")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("stablecoin_depeg_risk"), ValueAtom("not all stablecoins are equally stable or backed")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("mev_sandwich_attacks"), ValueAtom("use private mempools or MEV protection for large trades")))
    metta.space().add_atom(E(S("on_chain_trading_101"), S("regulatory_uncertainty"), ValueAtom("consider jurisdiction and regulatory compliance")))
    
    # On-Chain Finance FAQs by User Type
    # Beginner Questions
    metta.space().add_atom(E(S("faq_beginner"), S("How much should I risk in DeFi?"), ValueAtom("Start with 1-5% of portfolio, money you can afford to lose")))
    metta.space().add_atom(E(S("faq_beginner"), S("What's the safest way to start?"), ValueAtom("Begin with established lending protocols like Aave on major networks")))
    metta.space().add_atom(E(S("faq_beginner"), S("How do I avoid getting rekt?"), ValueAtom("Stick to audited protocols, understand impermanent loss, never invest more than you can lose")))
    metta.space().add_atom(E(S("faq_beginner"), S("What are gas fees?"), ValueAtom("Transaction costs on blockchain, can be $5-100+ on Ethereum during congestion")))
    metta.space().add_atom(E(S("faq_beginner"), S("Should I use yield farming?"), ValueAtom("Only after understanding impermanent loss and smart contract risks")))
    
    # Researcher Questions  
    metta.space().add_atom(E(S("faq_researcher"), S("How do I evaluate protocol risk?"), ValueAtom("Check audit reports, TVL stability, team background, and tokenomics")))
    metta.space().add_atom(E(S("faq_researcher"), S("What metrics matter for LP positions?"), ValueAtom("Impermanent loss vs fees earned, volume trends, pool composition changes")))
    metta.space().add_atom(E(S("faq_researcher"), S("How do I assess yield sustainability?"), ValueAtom("Analyze token emission schedules, protocol revenue, and user growth")))
    metta.space().add_atom(E(S("faq_researcher"), S("What are oracle risks?"), ValueAtom("Price feed manipulation, centralization, and latency issues affecting protocols")))
    
    # Sophisticated Trader Questions
    metta.space().add_atom(E(S("faq_trader"), S("How do I optimize for MEV protection?"), ValueAtom("Use private mempools, flashbots, or DEX aggregators with MEV protection")))
    metta.space().add_atom(E(S("faq_trader"), S("What's the best leverage strategy?"), ValueAtom("Risk-adjusted returns depend on funding costs, liquidation thresholds, and volatility")))
    metta.space().add_atom(E(S("faq_trader"), S("How do I arbitrage cross-chain?"), ValueAtom("Monitor price discrepancies, factor bridge fees/time, manage bridge risks")))
    metta.space().add_atom(E(S("faq_trader"), S("When should I use flash loans?"), ValueAtom("For atomic arbitrage, liquidations, or collateral swaps without capital requirements")))
    
    # Institutional Questions
    metta.space().add_atom(E(S("faq_institutional"), S("How do we manage treasury risk?"), ValueAtom("Diversify across protocols/chains, use institutional-grade custody, limit exposure per protocol")))
    metta.space().add_atom(E(S("faq_institutional"), S("What's our regulatory exposure?"), ValueAtom("Consider jurisdiction, reporting requirements, and potential token classification changes")))
    metta.space().add_atom(E(S("faq_institutional"), S("How do we scale DeFi operations?"), ValueAtom("Automate through vaults, use multi-sig governance, implement risk management frameworks")))
    metta.space().add_atom(E(S("faq_institutional"), S("What's appropriate position sizing?"), ValueAtom("Typically 1-10% of AUM in DeFi, with limits per protocol and strategy type")))
    
   
