import json
from openai import OpenAI
from .investment_rag import InvestmentRAG

class LLM:
    def __init__(self, api_key):
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.asi1.ai/v1"
        )

    def create_completion(self, prompt, max_tokens=200):
        completion = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="asi1-mini",
            max_tokens=max_tokens
        )
        return completion.choices[0].message.content

def get_intent_and_keyword(query, llm):
    """Use ASI:One API to classify On Chain Finance advice intent and extract a keyword."""
    prompt = (
        f"Given the investment query: '{query}'\n"
        "Classify the intent as one of: 'risk_profile', 'risk_level', 'expected_return', 'goal_strategy', 'on_chain_trading_101', 'faq_beginner', 'faq_researcher', 'faq_trader', 'faq_institutional', 'protocol_info', 'protocol_metrics', 'protocol_risks', 'protocol_operations', or 'unknown'.\n"
        "Extract the most relevant keyword from the query:\n"
        "- For risk_profile: conservative, moderate, aggressive\n"
        "- For investment types: lending, staking, yield_farming, derivatives, etc.\n"
        "- For protocols: uniswap_v3, aave, gmx, curve, yearn, etc.\n"
        "- For goals: passive_income, speculation, wealth_preservation, etc.\n"
        "- For concepts: impermanent_loss, gas_fees, smart_contract_risk, etc.\n"
        "Return *only* the result in JSON format like this, with no additional text:\n"
        "{\n"
        "  \"intent\": \"<classified_intent>\",\n"
        "  \"keyword\": \"<extracted_keyword>\"\n"
        "}"
    )
    response = llm.create_completion(prompt)
    try:
        result = json.loads(response)
        return result["intent"], result["keyword"]
    except json.JSONDecodeError:
        print(f"Error parsing ASI:One response: {response}")
        return "unknown", None

def generate_knowledge_response(query, intent, keyword, llm):
    """Use ASI:One to generate a response for new knowledge based on intent."""
    if intent == "risk_profile":
        prompt = (
            f"Query: '{query}'\n"
            f"The risk profile '{keyword}' is not in my knowledge base. Suggest plausible investment types only related with blockchain on-chain finance for this risk level.\n"
            "Return *only* the investment types, no additional text."
        )
    elif intent == "protocol_info":
        prompt = (
            f"Query: '{query}'\n"
            f"The protocol '{keyword}' is not in my knowledge base. Provide basic information about this DeFi protocol including its type (AMM, lending, yield, derivatives) and main use cases.\n"
            "Return *only* the protocol information, no additional text."
        )
    elif intent in ["faq_beginner", "faq_researcher", "faq_trader", "faq_institutional"]:
        user_type = intent.replace("faq_", "")
        prompt = (
            f"Query: '{query}'\n"
            f"This is a {user_type} level question about '{keyword}' in DeFi/on-chain finance. Provide an appropriate answer for this user sophistication level.\n"
            "Return *only* the answer, no additional text."
        )
    elif intent == "on_chain_trading_101":
        prompt = (
            f"Query: '{query}'\n"
            f"Explain the concept '{keyword}' as part of on-chain trading education. Focus on risks and best practices.\n"
            "Return *only* the educational content, no additional text."
        )
    else:
        return None
    return llm.create_completion(prompt)

def process_query(query, rag: InvestmentRAG, llm: LLM):
    intent, keyword = get_intent_and_keyword(query, llm)
    print(f"Intent: {intent}, Keyword: {keyword}")
    prompt = ""
    
    if intent == "risk_profile" and keyword:
        investments = rag.query_risk_profile(keyword)
        if not investments:
            investment_types = generate_knowledge_response(query, intent, keyword, llm)
            rag.add_knowledge("risk_profile", keyword, investment_types)
            print(f"Knowledge graph updated - Added risk profile: '{keyword}' → '{investment_types}'")
            prompt = (
                f"Query: '{query}'\n"
                f"Risk Profile: {keyword}\n"
                f"Suitable Investments: {investment_types}\n"
                "Provide professional investment recommendations with risk disclaimers."
            )
        else:
            investment_details = []
            for investment in investments:
                returns = rag.get_expected_return(investment)
                risks = rag.get_risk_level(investment)
                investment_details.append({
                    'type': investment,
                    'returns': returns[0] if returns else 'N/A',
                    'risks': risks[0] if risks else 'N/A'
                })
            
            prompt = (
                f"Query: '{query}'\n"
                f"Risk Profile: {keyword}\n"
                f"Investment Options: {investment_details}\n"
                "Provide professional investment recommendations with expected returns and risk analysis."
            )
    
    elif intent == "risk_level" and keyword:
        risk_info = rag.query_relation("risk_level", keyword)
        prompt = (
            f"Query: '{query}'\n"
            f"Risk Level for {keyword}: {risk_info if risk_info else 'Not found'}\n"
            "Explain the risk characteristics and provide safety recommendations."
        )
    
    elif intent == "expected_return" and keyword:
        return_info = rag.query_relation("expected_return", keyword)
        prompt = (
            f"Query: '{query}'\n"
            f"Expected Returns for {keyword}: {return_info if return_info else 'Not found'}\n"
            "Explain the return potential and factors affecting performance."
        )
    
    elif intent == "goal_strategy" and keyword:
        strategy_info = rag.query_relation("goal_strategy", keyword)
        prompt = (
            f"Query: '{query}'\n"
            f"Investment Strategy for {keyword}: {strategy_info if strategy_info else 'Not found'}\n"
            "Provide detailed strategy recommendations for this goal."
        )
    
    elif intent == "on_chain_trading_101" and keyword:
        education_info = rag.query_relation("on_chain_trading_101", keyword)
        if not education_info:
            education_content = generate_knowledge_response(query, intent, keyword, llm)
            prompt = (
                f"Query: '{query}'\n"
                f"Educational Content: {education_content}\n"
                "Provide comprehensive educational guidance on this topic."
            )
        else:
            prompt = (
                f"Query: '{query}'\n"
                f"Trading 101 - {keyword}: {education_info}\n"
                "Expand on this educational content with practical examples."
            )
    
    elif intent in ["faq_beginner", "faq_researcher", "faq_trader", "faq_institutional"] and keyword:
        faq_info = rag.query_relation(intent, keyword)
        if not faq_info:
            faq_answer = generate_knowledge_response(query, intent, keyword, llm)
            prompt = (
                f"Query: '{query}'\n"
                f"Answer: {faq_answer}\n"
                "Provide a comprehensive response appropriate for this user level."
            )
        else:
            prompt = (
                f"Query: '{query}'\n"
                f"FAQ Answer: {faq_info}\n"
                "Expand on this answer with additional context and examples."
            )
    
    elif intent.startswith("protocol_") and keyword:
        # Handle protocol-specific queries
        if intent == "protocol_info":
            protocol_type = rag.query_relation("protocol_type", keyword)
            protocol_strategy = rag.query_relation("protocol_strategy", keyword)
            prompt = (
                f"Query: '{query}'\n"
                f"Protocol: {keyword}\n"
                f"Type: {protocol_type if protocol_type else 'Unknown'}\n"
                f"Strategy: {protocol_strategy if protocol_strategy else 'Unknown'}\n"
                "Provide detailed information about this protocol."
            )
        elif intent == "protocol_metrics":
            metrics = rag.query_relation("protocol_metrics", keyword)
            prompt = (
                f"Query: '{query}'\n"
                f"Available Metrics for {keyword}: {metrics if metrics else 'Not found'}\n"
                "Explain these metrics and their importance for analysis."
            )
        elif intent == "protocol_risks":
            risks = rag.query_relation("protocol_risks", keyword)
            prompt = (
                f"Query: '{query}'\n"
                f"Risk Factors for {keyword}: {risks if risks else 'Not found'}\n"
                "Analyze these risks and provide risk management strategies."
            )
        elif intent == "protocol_operations":
            operations = rag.query_relation("protocol_operations", keyword)
            prompt = (
                f"Query: '{query}'\n"
                f"Available Operations for {keyword}: {operations if operations else 'Not found'}\n"
                "Explain how to use these operations effectively."
            )
   
    
    if not prompt:
        prompt = f"Query: '{query}'\nNo specific investment information found. Provide general investment guidance and suggest consulting a financial advisor."

    prompt += "\nFormat response as: 'Selected Question: <question>' on first line, 'Investment Advice: <response>' on second. Include appropriate disclaimers about consulting financial professionals."
    response = llm.create_completion(prompt, max_tokens=300)
    try:
        selected_q = response.split('\n')[0].replace("Selected Question: ", "").strip()
        answer = response.split('\n')[1].replace("Investment Advice: ", "").strip()
        return {"selected_question": selected_q, "humanized_answer": answer}
    except IndexError:
        return {"selected_question": query, "humanized_answer": response}