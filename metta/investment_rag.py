import re
from hyperon import MeTTa, E, S, ValueAtom

class InvestmentRAG:
    def __init__(self, metta_instance: MeTTa):
        self.metta = metta_instance

    def query_risk_profile(self, risk_profile):
        """Find investment types suitable for a risk profile."""
        risk_profile = risk_profile.strip('"')
        query_str = f'!(match &self (risk_profile {risk_profile} $investment) $investment)'
        results = self.metta.run(query_str)
        print(results, query_str)

        unique_investments = list(set(str(r[0]) for r in results if r and len(r) > 0)) if results else []
        return unique_investments
    
    
    def add_knowledge(self, relation_type, subject, object_value):
        """Add new investment knowledge dynamically."""
        if isinstance(object_value, str):
            object_value = ValueAtom(object_value)
        self.metta.space().add_atom(E(S(relation_type), S(subject), object_value))
        return f"Added {relation_type}: {subject} → {object_value}"