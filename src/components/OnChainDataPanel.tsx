import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, Activity, DollarSign, Fuel, Users, ExternalLink } from 'lucide-react';

interface OnChainDataPanelProps {
  onViewDetails: () => void;
}

export function OnChainDataPanel({ onViewDetails }: OnChainDataPanelProps) {
  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2>On-Chain Data Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time blockchain metrics</p>
        </div>
        <Button onClick={onViewDetails} variant="outline" size="sm">
          View Details
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-blue-500/20 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ETH Price</p>
                <p className="text-2xl">$3,250</p>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+14.0%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl">$12.5B</p>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+8.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gas Fee</p>
                <p className="text-2xl">22 Gwei</p>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">-12.0%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Fuel className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl">145K</p>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+5.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Market Summary</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Market Cap</p>
                <p>$390.2B</p>
              </div>
              <div>
                <p className="text-muted-foreground">24h High</p>
                <p>$3,285</p>
              </div>
              <div>
                <p className="text-muted-foreground">24h Low</p>
                <p>$2,845</p>
              </div>
              <div>
                <p className="text-muted-foreground">TVL</p>
                <p>$52.8B</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Click "View Details" to see comprehensive charts and analytics
          </p>
        </div>
      </div>
    </div>
  );
}
