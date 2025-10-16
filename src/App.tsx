import { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { OnChainDataPanel } from './components/OnChainDataPanel';
import { SmartContractPanel } from './components/SmartContractPanel';
import { DataDetailsPage } from './components/DataDetailsPage';
import { Button } from './components/ui/button';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from './components/ui/resizable';
import { 
  MessageSquare, 
  BarChart3, 
  FileCode, 
  LayoutDashboard 
} from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type LayoutMode = 'chat-only' | 'chat-data' | 'chat-contract';
type ViewMode = 'main' | 'data-details';

export default function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('chat-only');
  const [viewMode, setViewMode] = useState<ViewMode>('main');

  const handleViewDataDetails = () => {
    setViewMode('data-details');
  };

  const handleBackToMain = () => {
    setViewMode('main');
  };

  // Data Details View (Full Screen)
  if (viewMode === 'data-details') {
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
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>Blockchain AI Assistant</h1>
              <p className="text-sm text-muted-foreground">On-chain intelligence & smart contract execution</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={layoutMode === 'chat-only' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('chat-only')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat Only
            </Button>
            <Button
              variant={layoutMode === 'chat-data' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('chat-data')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              + Data
            </Button>
            <Button
              variant={layoutMode === 'chat-contract' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('chat-contract')}
            >
              <FileCode className="w-4 h-4 mr-2" />
              + Contract
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {layoutMode === 'chat-only' ? (
          <div className="h-full max-w-4xl mx-auto">
            <ChatInterface onLayoutChange={setLayoutMode} />
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <ChatInterface onLayoutChange={setLayoutMode} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              {layoutMode === 'chat-data' ? (
                <OnChainDataPanel onViewDetails={handleViewDataDetails} />
              ) : (
                <SmartContractPanel />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
