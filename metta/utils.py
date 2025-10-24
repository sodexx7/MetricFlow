import json
from openai import OpenAI
from .investment_rag import InvestmentRAG
from .protocols_knowledge import initialize_protocols_knowledge
from hyperon import MeTTa

from .protocol_data_models import (
            Strategy, AMMStrategy, LendingStrategy, 
            AMMProtocol, LendingProtocol, AMMConfig, LendingConfig,
            AMMMetric, LendingMetric, ProtocolType, OperationType, Network
        )


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
#    'goal_strategy', 
    prompt = (
        f"Given the investment query: '{query}'\n"
        "Classify the intent as one of: 'risk_profile', 'risk_level', 'expected_return', 'goal_strategy', 'on_chain_trading_101', 'faq_beginner', 'faq_researcher', 'faq_trader', 'faq_institutional', 'protocol_info', 'protocol_metrics', 'protocol_risks', 'protocol_operations', or 'unknown'.\n"
        "Extract the most relevant keyword from the query:\n"
        "- For risk_profile: conservative, moderate, aggressive\n"
        "- For investment types: lending, staking, yield_farming, derivatives, etc.\n"
        "- For protocols: uniswap_v3, aave, gmx, curve, yearn, etc.\n"
        # "- For goals: passive_income, speculation, wealth_preservation, etc.\n"
        "- For specific strategy: passive_income, speculation, wealth_preservation, etc.\n"
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

def query_protocols_for_strategy(strategy_keyword, llm: LLM):
    """Query available protocols for a specific strategy and get concrete strategy recommendations."""
    try:
        # Initialize MeTTa space with protocols knowledge
        metta = MeTTa()
        initialize_protocols_knowledge(metta)
        
        # Get available protocols for the strategy
        available_protocols = []
        
        # Hard-coded strategy to protocol mapping based on protocols_knowledge.py
        strategy_to_protocols = {
            'yield_farming': ['uniswap_v3', 'balancer', 'convex'],
            'lending': ['aave', 'compound', 'morpho', 'euler'],
            'stablecoin_lp': ['curve'],
            'yield_vaults': ['yearn'],
            'yield_trading': ['pendle'],
            'perpetuals': ['gmx', 'dydx'],
            'synthetic_assets': ['synthetix']
        }
        
        # Find protocols for the requested strategy
        if strategy_keyword in strategy_to_protocols:
            available_protocols = strategy_to_protocols[strategy_keyword]
        else:
            # Check for partial matches or related strategies
            for strategy, protocols in strategy_to_protocols.items():
                if strategy_keyword.lower() in strategy.lower() or strategy.lower() in strategy_keyword.lower():
                    available_protocols.extend(protocols)
        
        if not available_protocols:
            # Generate suggestion using AI for unknown strategy
            all_strategies = list(strategy_to_protocols.keys())
            all_protocols = list(set([p for protocols in strategy_to_protocols.values() for p in protocols]))
            
            prompt = (
                f"Strategy requested: '{strategy_keyword}'\n"
                f"Available strategies in our protocol knowledge: {all_strategies}\n"
                f"Available protocols: {all_protocols}\n"
                "Suggest the most relevant protocols and concrete strategies for the requested strategy. "
                "Return only a JSON object with 'protocols' array and 'concrete_strategies' array."
            )
            ai_response = llm.create_completion(prompt, max_tokens=300)
            try:
                suggestion = json.loads(ai_response)
                return suggestion
            except json.JSONDecodeError:
                return {
                    "protocols": all_protocols[:3],  # Limit to top 3
                    "concrete_strategies": [f"No specific protocols found for '{strategy_keyword}'. Consider exploring lending, yield farming, or AMM strategies."]
                }
        
        # Get additional protocol information for found protocols
        protocol_details = []
        
        # Protocol type mapping
        protocol_types = {
            'uniswap_v3': 'amm', 'curve': 'amm', 'balancer': 'amm',
            'aave': 'lending', 'compound': 'lending', 'morpho': 'lending', 'euler': 'lending',
            'yearn': 'yield', 'convex': 'yield', 'pendle': 'yield',
            'gmx': 'derivatives', 'synthetix': 'derivatives', 'dydx': 'derivatives'
        }
        
        # Protocol metrics mapping (simplified)
        protocol_metrics = {
            'uniswap_v3': 'trading_pair, current_price, liquidity_volume, impermanent_loss',
            'curve': 'trading_pair, current_price, liquidity_volume, depeg_events',
            'balancer': 'trading_pair, current_price, liquidity_volume, weight_changes',
            'aave': 'supply_rate, borrow_rate, utilization_rate, liquidation_threshold',
            'compound': 'supply_rate, borrow_rate, utilization_rate, governance_proposals',
            'morpho': 'supply_rate, borrow_rate, peer_to_peer_matching',
            'euler': 'supply_rate, borrow_rate, tier_status',
            'yearn': 'vault_apy, strategy_performance, harvest_frequency',
            'convex': 'boosted_rewards, vote_locked_cvx, curve_gauge_weights',
            'pendle': 'yield_token_price, principal_token_price, implied_apy',
            'gmx': 'open_interest, funding_rate, liquidation_price, pnl',
            'synthetix': 'debt_pool_composition, collateralization_ratio',
            'dydx': 'perpetual_funding, position_size, margin_ratio'
        }
        
        # Protocol operations mapping
        protocol_operations = {
            'uniswap_v3': 'swap, liquidity_provision, fee_collection',
            'curve': 'swap, liquidity_provision, gauge_voting',
            'balancer': 'swap, liquidity_provision, weighted_pools',
            'aave': 'supply, borrow, liquidate, flashloan',
            'compound': 'supply, borrow, liquidate, governance_voting',
            'morpho': 'supply, borrow, peer_to_peer_matching',
            'euler': 'supply, borrow, liquidate, risk_management',
            'yearn': 'deposit, withdraw, harvest, strategy_execution',
            'convex': 'stake, boost_rewards, vote_locking',
            'pendle': 'split_yield, trade_yield, liquidity_provision',
            'gmx': 'open_position, close_position, liquidate',
            'synthetix': 'mint_synths, trade_synths, stake_snx',
            'dydx': 'open_perpetual, close_perpetual, margin_trading'
        }
        
        for protocol in available_protocols[:5]:  # Limit to top 5 protocols
            protocol_details.append({
                "name": protocol,
                "type": protocol_types.get(protocol, "unknown"),
                "metrics": protocol_metrics.get(protocol, "No metrics available"),
                "operations": protocol_operations.get(protocol, "No operations available")
            })
        
        # Use AI to generate concrete strategies combining protocols with user's expected strategy
        prompt = (
            f"User requested strategy: '{strategy_keyword}'\n"
            f"Available protocols: {protocol_details}\n"
            "Based on the available protocols and their capabilities, provide concrete, actionable investment strategies. "
            "Include specific steps, risk considerations, and expected outcomes. "
            "Format as JSON with 'concrete_strategies' array containing detailed strategy objects with 'description', 'protocols_used', 'risk_level', and 'expected_return_range'."
        )
        

        #  Current test for simple strategis
        # LP ETH/USDC on Uniswap Labs with concentrated liquidity
        # Open short position of ETH on GMX or Synthetix
        ai_response = llm.create_completion(prompt, max_tokens=400)
        try:
            concrete_strategies = json.loads(ai_response)
            return {
                "protocols": protocol_details,
                "concrete_strategies": concrete_strategies.get("concrete_strategies", [])
            }
        except json.JSONDecodeError:
            # Fallback response
            return {
                "protocols": protocol_details,
                "concrete_strategies": [
                    {
                        "description": f"Implement {strategy_keyword} strategy using available protocols",
                        "protocols_used": [p["name"] for p in protocol_details],
                        "risk_level": "Medium",
                        "expected_return_range": "5-15% APY"
                    }
                ]
            }
    
    except Exception as e:
        print(f"Error in query_protocols_for_strategy: {e}")
        # Return a basic fallback response
        return {
            "protocols": [],
            "concrete_strategies": [
                {
                    "description": f"Strategy '{strategy_keyword}' analysis unavailable. Recommend consulting with DeFi protocols directly.",
                    "protocols_used": [],
                    "risk_level": "Unknown",
                    "expected_return_range": "Variable"
                }
            ]
        }

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
    # TODO below should adjust
    elif intent == "goal_strategy" and keyword:
        # Get available protocols for the strategy
        strategy_info = rag.query_relation("goal_strategy", keyword)
        print(f"strategy_info: {strategy_info}")
        # strategy_to_protocols = {
        #     'yield_farming': ['uniswap_v3', 'balancer', 'convex'],
        #     'lending': ['aave', 'compound', 'morpho', 'euler'],
        #     'stablecoin_lp': ['curve'],
        #     'yield_vaults': ['yearn'],
        #     'yield_trading': ['pendle'],
        #     'perpetuals': ['gmx', 'dydx'],
        #     'synthetic_assets': ['synthetix']
        # }

        strategy_to_protocols = {
            'yield_farming': ['uniswap_v3'],
            'lending': ['compound'],
            'stablecoin_lp': ['curve'],
            'yield_vaults': ['yearn'],
            'yield_trading': ['pendle'],
            'perpetuals': ['dydx'],
            'synthetic_assets': ['synthetix']
        }
        
        print(f"strategy_to_protocols: {strategy_to_protocols}")
        
        prompt = (
            f"Query: '{query}'\n"
            f"Strategy: {keyword}\n"
             f"Investment Strategy for {keyword}: {strategy_info if strategy_info else 'Not found'}\n"
            f"Available Protocols: {strategy_to_protocols}\n"
            "Provide investment strategy recommendations for this goal. Format your response as a numbered list with clear steps, allocation percentages, and specific protocols. Use this structure:\n"
            "1. **Protocol Name (Allocation %):** Description and implementation steps\n"
            "2. **Protocol Name (Allocation %):** Description and implementation steps\n"
            "Include risk considerations and rebalancing advice at the end."
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
    
    # Use higher max_tokens for goal_strategy to ensure complete responses
    max_tokens = 800 if intent == "goal_strategy" else 300
    response = llm.create_completion(prompt, max_tokens=max_tokens)
    # todo, return strcuted format data for data panel displaying
    print(f"test--response: {response}")
    try:
        lines = response.split('\n')
        selected_q = lines[0].replace("Selected Question: ", "").strip()
        
        # Find the line with "Investment Advice:" and get all content after it
        investment_advice_start = -1
        for i, line in enumerate(lines):
            if "Investment Advice:" in line:
                investment_advice_start = i
                break
        
        if investment_advice_start >= 0:
            # Get the content after "Investment Advice:" on the same line
            first_line = lines[investment_advice_start].replace("Investment Advice: ", "").strip()
            # Get all remaining lines
            remaining_lines = lines[investment_advice_start + 1:]
            # Combine all content
            answer = first_line
            if remaining_lines:
                answer += "\n" + "\n".join(remaining_lines)
        else:
            # Fallback: take everything after the first line
            answer = "\n".join(lines[1:])
        
        answer = answer.strip()
        print(f"test--answer: {answer}")
        return {"selected_question": selected_q, "humanized_answer": answer}
    except IndexError:
        return {"selected_question": query, "humanized_answer": response}

def convert_ai_output_to_spec_strategies(ai_response_content: str, llm: LLM):
    """
    Convert AI output content into structured Strategy objects.
    Extracts protocol names and operations, then constructs Strategy objects.
    """
    if not ai_response_content:
        return None
    
    # Use AI to extract protocol names and operations from the content
    prompt = f"""
    Extract protocol names and operations from this investment strategy content:
    
    {ai_response_content}
    
    Look for mentions of these protocols:
    AMM protocols: uniswap, uniswap_v3, curve, balancer
    Lending protocols: aave, compound, morpho, euler
    
    Operations mentioned: swap, lending, borrowing, yield_farming, liquidity provision
    
    Return JSON format:
    {{
        "extracted_strategies": [
            {{
                "protocol": "protocol_name",
                "operation": "operation_type"
            }}
        ]
    }}
    
    Return only valid JSON, no additional text.
    """
    
    try:
        response = llm.create_completion(prompt, max_tokens=400)
        print("AI JSON extraction response:")
        print(f"Response type: {type(response)}")
        print(f"Response length: {len(response) if response else 0}")
        print(f"Response content: '{response}'")
        print("-" * 50)
        
        if not response or not response.strip():
            print("Empty response from AI, returning None")
            return None
            
        extracted_data = json.loads(response)
        print(f"Parsed JSON data: {extracted_data}")
        
        # Convert extracted data to Strategy objects
        strategies = []
        for i, item in enumerate(extracted_data.get("extracted_strategies", [])):
            print(f"\nProcessing strategy {i+1}: {item}")
            protocol_name = item.get("protocol", "")
            operation = item.get("operation", "")
            print(f"Protocol: {protocol_name}, Operation: {operation}")
            
            # Determine protocol type
            amm_protocols = ["uniswap", "uniswap_v3", "curve", "balancer"]
            lending_protocols = ["aave", "compound", "morpho", "euler"]
            
            try:
                if any(p in protocol_name.lower() for p in amm_protocols):
                    print(f"Creating AMM strategy for {protocol_name}")
                    strategy_obj = _create_amm_strategy_object(protocol_name, operation)
                elif any(p in protocol_name.lower() for p in lending_protocols):
                    print(f"Creating lending strategy for {protocol_name}")
                    strategy_obj = _create_lending_strategy_object(protocol_name, operation)
                else:
                    print(f"Unknown protocol type for {protocol_name}, skipping")
                    continue
                    
                if strategy_obj:
                    print(f"Successfully created strategy: {strategy_obj}")
                    strategies.append(strategy_obj)
                else:
                    print(f"Failed to create strategy for {protocol_name}")
            except Exception as e:
                print(f"Error creating strategy for {protocol_name}: {e}")
                continue
        
        return strategies
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Failed to parse response: '{response}'")
        return None
    except Exception as e:
        print(f"Error converting AI output to strategies: {e}")
        return None

def _create_amm_strategy_object(protocol_name: str, operation: str):
    """Create AMM Strategy object with basic data."""
    
    # Create AMM config with required fields
    amm_config = AMMConfig(
        pair_name="ETH/USDC",
        pair_address="0x0000000000000000000000000000000000000000",
        network=Network.ARB,
        tokenA_address="0x0000000000000000000000000000000000000001",
        tokenB_address="0x0000000000000000000000000000000000000002"
    )
    
    # Create protocol
    amm_protocol = AMMProtocol(
        name=protocol_name,
        type=ProtocolType.AMM,
        ammConfig=amm_config
    )
    
    # Create metrics - include all relevant AMM metrics
    amm_metrics = [AMMMetric.historical_price, AMMMetric.liquidity_volume, AMMMetric.avg_liquidity_7day]
    
    # Determine operation type
    if "liquidity" in operation.lower() or "lp" in operation.lower() or "yield" in operation.lower():
        op_type = OperationType.LP
    else:
        op_type = OperationType.SWAP
    
    # Create strategy with protocol and optional fields based on available data
    strategy_data = {"protocol": amm_protocol}
    
    # Add operation if available
    if operation:
        strategy_data["operation"] = op_type
    
    # Add metrics if we have operation context
    if operation:
        strategy_data["metrics"] = amm_metrics
    
    amm_strategy = AMMStrategy(**strategy_data)
    
    return Strategy(strategy=amm_strategy)

def _create_lending_strategy_object(protocol_name: str, operation: str):
    """Create lending Strategy object with basic data."""
    from .protocol_data_models import (
        Strategy, LendingStrategy, LendingProtocol, LendingConfig, LendingMetric,
        ProtocolType, OperationType
    )
    
    # Create lending config with required fields
    lending_config = LendingConfig(
        address_name=f"{protocol_name}_pool",
        lending_token_address="0x0000000000000000000000000000000000000003"
    )
    
    # Create protocol
    lending_protocol = LendingProtocol(
        name=protocol_name,
        type=ProtocolType.LENDING,
        lendingConfig=lending_config
    )
    
    # Create metrics - include all relevant lending metrics
    lending_metrics = [LendingMetric.tvl, LendingMetric.expected_yield]
    
    # Determine operation type
    if "borrow" in operation.lower():
        op_type = OperationType.BORROWING
    else:
        op_type = OperationType.LENDING
    
    # Create strategy with protocol and optional fields based on available data
    strategy_data = {"protocol": lending_protocol}
    
    # Add operation if available
    if operation:
        strategy_data["operation"] = op_type
    
    # Add metrics if we have operation context
    if operation:
        strategy_data["metrics"] = lending_metrics
    
    lending_strategy = LendingStrategy(**strategy_data)
    
    return Strategy(strategy=lending_strategy)