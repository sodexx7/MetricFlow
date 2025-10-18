import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Bot, User } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  requiresOnChainData?: boolean;
  requiresContractOperation?: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your blockchain AI assistant. I can help you analyze on-chain data and execute smart contract strategies. What would you like to do today?",
      timestamp: new Date(),
    },
  ]);
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

      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: data.error 
          ? `Error: ${data.error}` 
          : (data.answer || "No response received from the AI service"),
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
                    message.role === "user" ? "bg-green-100" : "bg-blue-100"
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
                className={`p-3 max-w-[75%] break-words ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere text-sm leading-relaxed">
                  {message.content}
                </div>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about on-chain data or execute strategies..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Show me ETH price data")}
          >
            Price Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Execute a swap strategy")}
          >
            Execute Strategy
          </Button>
        </div>
      </div>
    </div>
  );
}
