import { useState } from "react";
import { ChatInterface, type Message } from "./components/ChatInterface";
import { OnChainDataPanel } from "./components/OnChainDataPanel";
import { SmartContractPanel } from "./components/SmartContractPanel";
import { DataDetailsPage } from "./components/DataDetailsPage";
import { Button } from "./components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { MessageSquare, BarChart3, FileCode, Bug } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "./components/ui/tooltip";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./contexts/ThemeContext";
import metricsFlowLogo from "./assets/MetricsFlowLogo.png";
import metricsFlowLogoWhite from "./assets/MetricsFlowLogoWhite.png";

type LayoutMode = "chat-only" | "chat-data" | "chat-contract";
type ViewMode = "main" | "data-details";

export default function App() {
  const { theme } = useTheme();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("chat-only");
  const [viewMode, setViewMode] = useState<ViewMode>("main");
  const [debugMode, setDebugMode] = useState(false);
  const [hasUniswapStrategy, setHasUniswapStrategy] = useState(false);
  const [uniswapStrategies, setUniswapStrategies] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your blockchain AI assistant. I can help you analyze on-chain data and execute smart contract strategies. What would you like to do today?",
      timestamp: new Date(),
    },
  ]);

  const handleUniswapDetected = (hasUniswap: boolean, strategies?: any[]) => {
    setHasUniswapStrategy(hasUniswap);
    setUniswapStrategies(strategies || []);
    console.log("=== UNISWAP DETECTION ===");
    console.log("Has Uniswap strategy:", hasUniswap);
    console.log("Uniswap strategies:", strategies);
    console.log("========================");
  };

  const handleNavigateToContract = () => {
    // Switch to contract layout
    setLayoutMode("chat-contract");
    
    // Wait for layout to update, then scroll to contract panel
    setTimeout(() => {
      const contractPanel = document.getElementById('contract-panel');
      if (contractPanel) {
        contractPanel.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNavigateToData = () => {
    // Switch to data layout
    setLayoutMode("chat-data");
  };


  const handleBackToMain = () => {
    setViewMode("main");
  };

  // Data Details View (Full Screen)
  if (viewMode === "data-details") {
    return (
      <div className="h-screen bg-background">
        <Toaster />
        <DataDetailsPage onBack={handleBackToMain} />
      </div>
    );
  }

  // Main View
  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <img
              src={theme === 'light' ? metricsFlowLogoWhite : metricsFlowLogo}
              alt="MetricsFlow Logo"
              className="object-contain"
              style={{ width: "90px", height: "90px" }}
            />
            <div>
              <p className="text-sm text-muted-foreground">
                AI-powered blockchain analytics & smart contract execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setDebugMode(!debugMode)}
                    className="flex-shrink-0"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    {debugMode ? "Debug On" : "Debug Off"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>AI conversation only work for local environment, this just directly show support metrics and contract operations</p>
                </TooltipContent>
              </Tooltip>
              <Button
                variant={layoutMode === "chat-only" ? "default" : "outline"}
                size="sm"
                onClick={() => setLayoutMode("chat-only")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat Only
              </Button>
              <Button
                variant={layoutMode === "chat-data" ? "default" : "outline"}
                size="sm"
                onClick={() => setLayoutMode("chat-data")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />+ Data
              </Button>
              {hasUniswapStrategy && (
                <Button
                  variant={layoutMode === "chat-contract" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayoutMode("chat-contract")}
                >
                  <FileCode className="w-4 h-4 mr-2" />+ Contract
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ConnectButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {layoutMode === "chat-only" && !debugMode ? (
          <div className="h-full max-w-4xl mx-auto">
            <ChatInterface 
              messages={messages} 
              setMessages={setMessages} 
              onUniswapDetected={handleUniswapDetected}
              onNavigateToContract={handleNavigateToContract}
              onNavigateToData={handleNavigateToData}
              debugMode={debugMode}
            />
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <ChatInterface 
                messages={messages} 
                setMessages={setMessages} 
                onUniswapDetected={handleUniswapDetected}
                onNavigateToContract={handleNavigateToContract}
                onNavigateToData={handleNavigateToData}
                debugMode={debugMode}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              {debugMode ? (
                /* Debug mode: Show data panel only, contract panel will be in separate horizontal panel */
                <OnChainDataPanel uniswapStrategies={uniswapStrategies} debugMode={debugMode} />
              ) : layoutMode === "chat-data" ? (
                <OnChainDataPanel uniswapStrategies={uniswapStrategies} debugMode={debugMode} />
              ) : hasUniswapStrategy ? (
                <div id="contract-panel" className="h-full overflow-hidden">
                  <SmartContractPanel />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No Uniswap strategies detected. Contract panel is hidden.</p>
                </div>
              )}
            </ResizablePanel>
            {debugMode && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={33} minSize={25}>
                  <div id="contract-panel" className="h-full overflow-hidden">
                    <SmartContractPanel />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
