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
    """Use ASI:One API to classify investment intent and extract a keyword."""
    prompt = (
        f"Given the investment query: '{query}'\n"
        # todo add more intent
        "Classify the intent as one of: 'risk_profile'.\n"
        "Extract the most relevant keyword (e.g., conservative, aggressive) from the query.\n"
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
            "The risk profile '{keyword}' is not in my knowledge base. Suggest plausible investment types only related with blockchain on-chain finance for this risk level.\n"
            "Return *only* the investment types, no additional text."
        )
    else:
        return None
    return llm.create_completion(prompt)

def process_query(query, rag: InvestmentRAG, llm: LLM):
    intent, keyword = get_intent_and_keyword(query, llm)
    print(f"Intent: {intent}, Keyword: {keyword}")
    prompt = ""
    # todo add more related intent 
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