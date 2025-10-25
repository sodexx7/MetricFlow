# OnChain Finance strategies Advisor Agent

## 1. On-Chain Finance Advisor

The On-Chain Finance Advisor provides users with comprehensive guidance on decentralized finance (DeFi), ranging from foundational protocol knowledge to tailored investment strategies. It also presents protocol metrics to support data-driven decision-making.

The advisor supplies specific strategies based on supported protocols. For example, if a user seeks stable income and a recommended strategy involves providing liquidity on Uniswap V3, the system will outline the steps to supply liquidity, after which the user can seamlessly execute the strategy through the front-end interface.

In addition to agent-to-agent communication, the advisor supports API endpoints. These endpoints not only replicate conversational capabilities but also return structured data, including supported protocol information, relevant metrics, and configuration parameters. This enables the front-end to display real-time metrics and recommend suitable strategies dynamically.

![AI_Agent_Architecture](https://raw.githubusercontent.com/sodexx7/MetricFlow/metric-flow-ai-agent/AI_agent.png)

## 2. User Segmentation

### Researchers

- Develop sophisticated strategies using primitive building blocks or advanced composable modules.

### Beginners

- Access intuitive metrics and educational resources designed to simplify DeFi concepts.
- Receive clear, structured risk-return analyses to support informed decision-making and learning.

### Experienced Users

- Monitor existing strategies with real-time protocol metrics.
- Identify emerging opportunities and optimize risk-adjusted returns through advanced analytics.

## 3. For developers

If the answer involves supported protocols, it will return the related strategy data, including protocol information, configuration, and available metrics. [protocol_data_models](https://github.com/sodexx7/MetricFlow/blob/metric-flow-ai-agent/metta/protocol_data_models.py)

## 4. Knowledge Graph Structure

The MeTTa knowledge graph contains comprehensive on-chain finance relationships:

### Core Investment Framework [OnChainFinance_knowledge](https://github.com/sodexx7/MetricFlow/blob/metric-flow-ai-agent/metta/OnChainFinance_knowledge.py)

- **Risk Profiles → Investment Types** (conservative → lending, staking; aggressive → derivatives, perpetuals)
- **Investment Types → Risk Levels** (lending → "low risk, stable yield"; perpetuals → "very high risk, funding costs")
- **Investment Types → Expected Returns** (yield_farming → "10-50% annually"; staking → "3-12% annually")
- **Investment Goals → Strategies** (passive_income → "lending, staking"; speculation → "options, derivatives")

### Protocol-Specific Knowledge [protocols_knowledge](https://github.com/sodexx7/MetricFlow/blob/metric-flow-ai-agent/metta/protocols_knowledge.py)

- **Protocols → Types** (aave → lending, uniswap_v3 → amm, gmx → derivatives)
- **Protocols → Strategies** (yearn → yield_vaults, curve → stablecoin_lp, dydx → perpetuals)
- **Protocols → Risk Vectors** (uniswap_v3 → "slippage, impermanent loss, MEV")
- **Protocols → Available Metrics** (aave → "supply_rate, borrow_rate, liquidation_threshold")
- **Protocols → Operations** (gmx → "open_position, close_position, liquidate")

## 5. Sample Questions

### 🎯 Risk Profile & Investment Recommendations

- “I’m a conservative investor with low risk tolerance. What on-chain strategies should I consider?”
- “I have moderate risk tolerance and want balanced on-chain yields. Which protocols do you recommend?”
- “I’m aggressive and want high-risk, high-reward DeFi strategies. What are my options?”

### 💰 Expected Returns & Performance

- “What returns can I expect from Aave lending?”
- “How much do yield farming strategies typically return?”
- “What’s the expected return on GMX perpetual trading?”
- “What are the APY ranges for stablecoin liquidity provision?”

### 🏛️ Protocol-Specific Queries

- “What are the risks of using Uniswap V3 for liquidity provision?”
- “How does Yearn Finance’s vault strategy work and what metrics should I track?”

### 🎯 Goal-Oriented DeFi Planning

- “How should I structure my portfolio for passive income in DeFi?”
- “What’s the best strategy for speculation in on-chain finance?”
- “I want to preserve wealth using DeFi. What are the safest options?”
- “How should institutions approach DeFi treasury management?”

> **Note:** When users request available strategies for a goal (e.g., passive income), the recommendations will be based on the supported protocols.

### 📚 Educational & Safety Queries

- “What is impermanent loss and how can I avoid it?”
- “How do gas fees impact my DeFi returns?”
- “What are the most common mistakes in yield farming?”
- “How can I protect myself from MEV sandwich attacks?”

### 🔰 User Level-Specific Questions

- “As a DeFi beginner, how much should I risk?”
- “What metrics should I analyze as a DeFi researcher?”
- “How do I optimize for MEV protection as a sophisticated trader?”
- “What position sizing strategies are appropriate for institutions?”

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.11+
- ASI:One API key

### Installation

1. **Clone the repository and enter metric-flow-ai-agent branck**

2. **Create virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   To get the ASI:One API Key, login to https://asi1.ai/ and go to **Developer** section, click on **Create New** and copy your API Key. Please refer this [guide](https://innovationlab.fetch.ai/resources/docs/asione/asi-one-quickstart#step-1-get-your-api-key) for detailed steps.

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Run the agent**:
   ```bash
   python agent.py
   ```

### Environment Variables

Create a `.env` file with:

```env
ASI_ONE_API_KEY=your_asi_one_api_key_here
```

## 🧪 Testing the Agent

1. **Start the agent**:

   ```bash
   python agent.py
   ```

2. **Access the inspector**:
   Visit the URL shown in the console (e.g., `https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8008&address=agent1qd674kgs3987yh84a309c0lzkuzjujfufwxslpzygcnwnycjs0ppuauektt`) and click on `Connect` and select the `Mailbox` option. For detailed steps for connecting Agents via Mailbox, please refer [here](https://innovationlab.fetch.ai/resources/docs/agent-creation/uagent-creation#mailbox-agents).

3. **Try metricsflow front-end**

   At the moment, only the local environment is supported. The branch front end can be accessed while running the local metric-ai-agent.

## TODO

1. Refactor the code and review the prompt’s efficiency.

2. Build a well-structured and resilient strategy data model along with related functions to provide sufficient flexibility for interacting with AI.

3. Implement a consistent approach to help the AI and front end maintain the strategy data model effectively.

## Materials

Reference [singularity-net-metta-fetch-financial-advisor-agent](https://github.com/fetchai/innovation-lab-examples/tree/main/web3/singularity-net-metta-fetch-financial-advisor-agent)
