export interface AMMConfig {
  pair_name: string;
  pair_address: string;
  network: string;
  tokenA_address: string;
  tokenB_address: string;
}

export interface Protocol {
  name: string;
  type: string;
  ammConfig?: AMMConfig;
}

export interface StrategyData {
  protocol: Protocol;
  metrics: string[];
  operation: string;
}

export interface Strategy {
  strategy: StrategyData;
}

export interface FinanceResponse {
  query: string;
  answer: string;
  selected_question?: string;
  strategies?: Strategy[];
  error?: string;
}

export interface Message {
  id: string;
  content: string | FinanceResponse;
  sender: 'user' | 'ai';
  timestamp: Date;
}