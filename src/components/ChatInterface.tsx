import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Bot, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  requiresOnChainData?: boolean;
  requiresContractOperation?: boolean;
}

interface ChatInterfaceProps {
  onLayoutChange: (layout: 'chat-only' | 'chat-data' | 'chat-contract') => void;
}

export function ChatInterface({ onLayoutChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your blockchain AI assistant. I can help you analyze on-chain data and execute smart contract strategies. What would you like to do today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response based on user input
    setTimeout(() => {
      let aiResponse: Message;
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('price') || lowerInput.includes('data') || lowerInput.includes('chart') || lowerInput.includes('volume')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'll fetch the latest on-chain data for you. Let me pull up the real-time metrics including price movements, trading volume, and gas fees.",
          timestamp: new Date(),
          requiresOnChainData: true,
        };
        onLayoutChange('chat-data');
      } else if (lowerInput.includes('execute') || lowerInput.includes('trade') || lowerInput.includes('swap') || lowerInput.includes('contract')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I've prepared the smart contract operation for you. Please review the transaction details and confirm when you're ready to execute.",
          timestamp: new Date(),
          requiresContractOperation: true,
        };
        onLayoutChange('chat-contract');
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I understand. You can ask me to:\n• Show real-time on-chain data (prices, volume, gas fees)\n• Execute trading strategies or smart contract operations\n• Analyze blockchain metrics and trends",
          timestamp: new Date(),
        };
        onLayoutChange('chat-only');
      }

      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2>Blockchain AI Assistant</h2>
            <p className="text-sm text-muted-foreground">Powered by on-chain intelligence</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={message.role === 'user' ? 'bg-green-100' : 'bg-blue-100'}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <Card
                className={`p-3 max-w-[80%] ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about on-chain data or execute strategies..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => setInput('Show me ETH price data')}>
            Price Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput('Execute a swap strategy')}>
            Execute Strategy
          </Button>
        </div>
      </div>
    </div>
  );
}
