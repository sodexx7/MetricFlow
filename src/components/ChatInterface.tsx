import { useState, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Bot, User, ExternalLink } from "lucide-react";
import { FinanceResponse, Message as FinanceMessage, Strategy } from "../types/finance";
import { checkHasUniswapStrategy } from "./StrategiesHandler";
import ReactMarkdown from 'react-markdown';

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | FinanceResponse;
  timestamp: Date;
  requiresOnChainData?: boolean;
  requiresContractOperation?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onUniswapDetected?: (hasUniswap: boolean, strategies?: Strategy[]) => void;
  onNavigateToContract?: () => void;
  onNavigateToData?: () => void;
}

export function ChatInterface({ messages, setMessages, onUniswapDetected, onNavigateToContract, onNavigateToData }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollRef.current && scrollRef.current.parentElement) {
      const scrollContainer = scrollRef.current.parentElement;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Call the backend API
      const response = await fetch("http://127.0.0.1:8008/on-chain-finance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: currentInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("=== API RESPONSE DEBUG ===");
      console.log("Response data:", JSON.stringify(data, null, 2));
      console.log("Response has strategies?", data.strategies && Array.isArray(data.strategies));
      console.log("Strategies array:", data.strategies);
      
      // Check if response has strategies (FinanceResponse format)
      const hasStrategies = data.strategies && Array.isArray(data.strategies);
      const financeResponse: FinanceResponse = hasStrategies ? data : {
        query: currentInput,
        answer: data.error ? `Error: ${data.error}` : data.answer || "No response received from the AI service",
        error: data.error,
        strategies: undefined
      };

      console.log("Final financeResponse:", financeResponse);

      // Check for Uniswap strategies and notify parent
      if (hasStrategies && onUniswapDetected) {
        console.log("Checking for Uniswap strategies...");
        const hasUniswap = checkHasUniswapStrategy(financeResponse.strategies);
        console.log("Uniswap detection result:", hasUniswap);
        
        // Filter Uniswap strategies to pass to parent
        const uniswapStrategies = hasUniswap ? financeResponse.strategies?.filter(strategy => 
          strategy.strategy.protocol.name.toLowerCase().includes("uniswap")
        ) : [];
        
        onUniswapDetected(hasUniswap, uniswapStrategies);
      }

      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: financeResponse,
        timestamp: new Date(),
      };

      // Remove loading message and add AI response in one update
      setMessages((prev) => {
        const withoutLoading = prev.slice(0, -1); // Remove loading message
        const newMessages = [...withoutLoading, aiResponse]; // Add AI response
        return newMessages;
      });
    } catch (error) {
      // Remove loading message and add error response
      setMessages((prev) => prev.slice(0, -1));

      const errorResponse: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `I'm sorry, I couldn't connect to the finance service. Please make sure the backend is running on port 8008. Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2>Blockchain AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Powered by on-chain intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback
                  className={
                    message.role === "user" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  }
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Card
                className={`p-6 max-w-[80%] break-words shadow-lg border-0 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white"
                    : "bg-card text-card-foreground border border-border"
                }`}
              >
                <div className="break-words overflow-wrap-anywhere">
                  {typeof message.content === 'string' ? (
                    message.role === 'user' ? (
                      <div className="whitespace-pre-wrap text-base leading-relaxed font-medium">{message.content}</div>
                    ) : (
                      <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-lg prose-p:mb-4 prose-p:leading-7 prose-strong:text-blue-600 prose-strong:font-semibold">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-lg prose-p:mb-6 prose-p:leading-7 prose-strong:text-blue-600 prose-strong:font-semibold prose-li:mb-2">
                        <ReactMarkdown>
                          {message.content.answer.split('\n\n').map((paragraph, index) => (
                            paragraph.trim() && `${paragraph}\n\n`
                          )).join('')}
                        </ReactMarkdown>
                      </div>
                      {message.content.strategies && checkHasUniswapStrategy(message.content.strategies) && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-lg">💡</span>
                            </div>
                            <p className="text-blue-800 font-medium">
                              Our protocol now supports Uniswap swapAndProvideLiquidity, you can check metrics in{" "}
                              <button 
                                className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors duration-200 inline-flex items-center gap-1"
                                onClick={() => {
                                  onNavigateToData?.();
                                }}
                              >
                                data <ExternalLink className="w-4 h-4" />
                              </button>
                              {" "}execute it in{" "}
                              <a 
                                href="#contract-panel" 
                                className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors duration-200 inline-flex items-center gap-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onNavigateToContract?.();
                                }}
                              >
                                contract <ExternalLink className="w-4 h-4" />
                              </a>
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <span className={`text-xs mt-4 block font-medium ${
                  message.role === "user" ? "opacity-80" : "text-muted-foreground"
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t p-6 flex-shrink-0 bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about on-chain data or execute strategies..."
            className="flex-1 text-base py-3 px-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 transition-all duration-200 shadow-lg border-0"
            style={{ backgroundColor: '#2563eb' }}
          >
            <Send className="w-4 h-4 text-white fill-white stroke-white" />
          </Button>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("As a DeFi beginner, how much should I risk?")}
            className="text-sm font-medium px-4 py-2 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 whitespace-nowrap"
          >
            🛡️ DeFi Risk Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("I want to achieve passive income in DeFi? Can you suggest some strategies for me?")}
            className="text-sm font-medium px-4 py-2 rounded-full border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 whitespace-nowrap"
          >
            💰 Passive Income Strategies
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("What are the risks of using Uniswap v3 for liquidity provision?")}
            className="text-sm font-medium px-4 py-2 rounded-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 whitespace-nowrap"
          >
            🦄 Uniswap v3 Risks
          </Button>
        </div>
      </div>
    </div>
  );
}
