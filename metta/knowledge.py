from hyperon import MeTTa, E, S, ValueAtom

def initialize_investment_knowledge(metta: MeTTa):
    """Initialize the MeTTa knowledge graph with risk, portfolio"""
    
    # Risk Profile → Investment Types
    metta.space().add_atom(E(S("risk_profile"), S("moderate"), S("liquidity_provider")))
    metta.space().add_atom(E(S("risk_profile"), S("aggressive"), S("options")))
    