from hyperon import MeTTa, E, S, ValueAtom

def initialize_protocols_knowledge(metta: MeTTa):
    """Initialize the MeTTa knowledge graph with specific protocol information and metrics"""
    
    # Protocol → Type Mapping
    # AMM Protocols
    metta.space().add_atom(E(S("protocol_type"), S("uniswap_v3"), S("amm")))
    metta.space().add_atom(E(S("protocol_type"), S("curve"), S("amm")))
    metta.space().add_atom(E(S("protocol_type"), S("balancer"), S("amm")))
    
    # Lending Protocols
    metta.space().add_atom(E(S("protocol_type"), S("aave"), S("lending")))
    metta.space().add_atom(E(S("protocol_type"), S("compound"), S("lending")))
    metta.space().add_atom(E(S("protocol_type"), S("morpho"), S("lending")))
    metta.space().add_atom(E(S("protocol_type"), S("euler"), S("lending")))
    
    # Yield Protocols
    metta.space().add_atom(E(S("protocol_type"), S("yearn"), S("yield")))
    metta.space().add_atom(E(S("protocol_type"), S("convex"), S("yield")))
    metta.space().add_atom(E(S("protocol_type"), S("pendle"), S("yield")))
    
    # Derivatives Protocols
    metta.space().add_atom(E(S("protocol_type"), S("gmx"), S("derivatives")))
    metta.space().add_atom(E(S("protocol_type"), S("synthetix"), S("derivatives")))
    metta.space().add_atom(E(S("protocol_type"), S("dydx"), S("derivatives")))
    
    # Protocol → Investment Strategy Mapping (linking to OnChainFinance_knowledge.py)
    # AMM protocols map to yield_farming/liquidity_providing
    metta.space().add_atom(E(S("protocol_strategy"), S("uniswap_v3"), S("yield_farming")))
    metta.space().add_atom(E(S("protocol_strategy"), S("curve"), S("stablecoin_lp")))
    metta.space().add_atom(E(S("protocol_strategy"), S("balancer"), S("yield_farming")))
    
    # Lending protocols map to lending strategy
    metta.space().add_atom(E(S("protocol_strategy"), S("aave"), S("lending")))
    metta.space().add_atom(E(S("protocol_strategy"), S("compound"), S("lending")))
    metta.space().add_atom(E(S("protocol_strategy"), S("morpho"), S("lending")))
    metta.space().add_atom(E(S("protocol_strategy"), S("euler"), S("lending")))
    
    # Yield protocols map to yield strategies
    metta.space().add_atom(E(S("protocol_strategy"), S("yearn"), S("yield_vaults")))
    metta.space().add_atom(E(S("protocol_strategy"), S("convex"), S("yield_farming")))
    metta.space().add_atom(E(S("protocol_strategy"), S("pendle"), S("yield_trading")))
    
    # Derivatives protocols map to aggressive strategies
    metta.space().add_atom(E(S("protocol_strategy"), S("gmx"), S("perpetuals")))
    metta.space().add_atom(E(S("protocol_strategy"), S("synthetix"), S("synthetic_assets")))
    metta.space().add_atom(E(S("protocol_strategy"), S("dydx"), S("perpetuals")))
    
    # Protocol → Network Mapping
    # todo check the based network
    metta.space().add_atom(E(S("protocol_network"), S("uniswap_v3"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("curve"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("balancer"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("aave"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("compound"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("morpho"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("euler"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("yearn"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("convex"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("pendle"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("gmx"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("synthetix"), S("arbitrum")))
    metta.space().add_atom(E(S("protocol_network"), S("dydx"), S("arbitrum")))
    
    # Protocol → Primary Risk Vectors
    # AMM Risks
    metta.space().add_atom(E(S("protocol_risks"), S("uniswap_v3"), ValueAtom("slippage, impermanent loss, MEV")))
    metta.space().add_atom(E(S("protocol_risks"), S("curve"), ValueAtom("slippage, depeg risk, smart contract")))
    metta.space().add_atom(E(S("protocol_risks"), S("balancer"), ValueAtom("impermanent loss, weight drift, MEV")))
    
    # Lending Risks
    metta.space().add_atom(E(S("protocol_risks"), S("aave"), ValueAtom("liquidation, protocol risk, rate volatility")))
    metta.space().add_atom(E(S("protocol_risks"), S("compound"), ValueAtom("liquidation, governance risk, rate changes")))
    metta.space().add_atom(E(S("protocol_risks"), S("morpho"), ValueAtom("protocol risk, market risk, liquidity")))
    metta.space().add_atom(E(S("protocol_risks"), S("euler"), ValueAtom("liquidation, tier risk, oracle risk")))
    
    # Yield Risks
    metta.space().add_atom(E(S("protocol_risks"), S("yearn"), ValueAtom("smart contract, strategy risk, slippage")))
    metta.space().add_atom(E(S("protocol_risks"), S("convex"), ValueAtom("protocol dependency, token risk")))
    metta.space().add_atom(E(S("protocol_risks"), S("pendle"), ValueAtom("interest rate risk, maturity risk")))
    
    # Derivatives Risks
    metta.space().add_atom(E(S("protocol_risks"), S("gmx"), ValueAtom("liquidation, funding costs, oracle risk")))
    metta.space().add_atom(E(S("protocol_risks"), S("synthetix"), ValueAtom("liquidation, debt pool risk, oracle")))
    metta.space().add_atom(E(S("protocol_risks"), S("dydx"), ValueAtom("liquidation, market risk, counterparty")))
    
    # Core Metrics Available by Protocol Type
    # Common metrics for all protocols
    metta.space().add_atom(E(S("common_metrics"), S("all_protocols"), ValueAtom("TVL, volume, user_count, fees_generated")))
    
    # AMM Specific Metrics
    metta.space().add_atom(E(S("protocol_metrics"), S("uniswap_v3"), ValueAtom("trading_pair, current_price, historical_price, liquidity_volume, 7day_avg_liquidity, impermanent_loss")))
    metta.space().add_atom(E(S("protocol_metrics"), S("curve"), ValueAtom("trading_pair, current_price, historical_price, liquidity_volume, 7day_avg_liquidity, impermanent_loss, depeg_events")))
    metta.space().add_atom(E(S("protocol_metrics"), S("balancer"), ValueAtom("trading_pair, current_price, historical_price, liquidity_volume, 7day_avg_liquidity, impermanent_loss, weight_changes")))
    
    # Lending Specific Metrics
    metta.space().add_atom(E(S("protocol_metrics"), S("aave"), ValueAtom("supply_rate, borrow_rate, utilization_rate, liquidation_threshold, health_factor, collateral_ratio")))
    metta.space().add_atom(E(S("protocol_metrics"), S("compound"), ValueAtom("supply_rate, borrow_rate, utilization_rate, liquidation_threshold, health_factor, collateral_ratio, governance_proposals")))
    metta.space().add_atom(E(S("protocol_metrics"), S("morpho"), ValueAtom("supply_rate, borrow_rate, utilization_rate, liquidation_threshold, health_factor, collateral_ratio, peer_to_peer_matching")))
    metta.space().add_atom(E(S("protocol_metrics"), S("euler"), ValueAtom("supply_rate, borrow_rate, utilization_rate, liquidation_threshold, health_factor, collateral_ratio, tier_status")))
    
    # Yield Specific Metrics
    metta.space().add_atom(E(S("protocol_metrics"), S("yearn"), ValueAtom("vault_apy, strategy_performance, harvest_frequency, fee_structure, underlying_assets")))
    metta.space().add_atom(E(S("protocol_metrics"), S("convex"), ValueAtom("boosted_rewards, vote_locked_cvx, curve_gauge_weights, reward_distribution")))
    metta.space().add_atom(E(S("protocol_metrics"), S("pendle"), ValueAtom("yield_token_price, principal_token_price, maturity_date, implied_apy, trading_volume")))
    
    # Derivatives Specific Metrics
    metta.space().add_atom(E(S("protocol_metrics"), S("gmx"), ValueAtom("open_interest, funding_rate, liquidation_price, pnl, leverage_ratio, liquidation_metrics")))
    metta.space().add_atom(E(S("protocol_metrics"), S("synthetix"), ValueAtom("debt_pool_composition, collateralization_ratio, rewards_distribution, synth_prices, liquidation_metrics")))
    metta.space().add_atom(E(S("protocol_metrics"), S("dydx"), ValueAtom("perpetual_funding, position_size, margin_ratio, liquidation_price, trading_fees, liquidation_metrics")))
    
    # Operations Available by Protocol
    metta.space().add_atom(E(S("protocol_operations"), S("uniswap_v3"), ValueAtom("swap, liquidity_provision, fee_collection")))
    metta.space().add_atom(E(S("protocol_operations"), S("curve"), ValueAtom("swap, liquidity_provision, gauge_voting, fee_collection")))
    metta.space().add_atom(E(S("protocol_operations"), S("balancer"), ValueAtom("swap, liquidity_provision, weighted_pools, fee_collection")))
    metta.space().add_atom(E(S("protocol_operations"), S("aave"), ValueAtom("supply, borrow, liquidate, flashloan")))
    metta.space().add_atom(E(S("protocol_operations"), S("compound"), ValueAtom("supply, borrow, liquidate, governance_voting")))
    metta.space().add_atom(E(S("protocol_operations"), S("morpho"), ValueAtom("supply, borrow, peer_to_peer_matching")))
    metta.space().add_atom(E(S("protocol_operations"), S("euler"), ValueAtom("supply, borrow, liquidate, risk_management")))
    metta.space().add_atom(E(S("protocol_operations"), S("yearn"), ValueAtom("deposit, withdraw, harvest, strategy_execution")))
    metta.space().add_atom(E(S("protocol_operations"), S("convex"), ValueAtom("stake, boost_rewards, vote_locking")))
    metta.space().add_atom(E(S("protocol_operations"), S("pendle"), ValueAtom("split_yield, trade_yield, liquidity_provision")))
    metta.space().add_atom(E(S("protocol_operations"), S("gmx"), ValueAtom("open_position, close_position, liquidate, fee_distribution")))
    metta.space().add_atom(E(S("protocol_operations"), S("synthetix"), ValueAtom("mint_synths, trade_synths, stake_snx, liquidate")))
    metta.space().add_atom(E(S("protocol_operations"), S("dydx"), ValueAtom("open_perpetual, close_perpetual, margin_trading, liquidate")))