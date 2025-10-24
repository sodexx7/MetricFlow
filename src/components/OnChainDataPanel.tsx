import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign, Fuel, Users, BarChart3, Droplets, Clock } from 'lucide-react';
import { Strategy } from '../types/finance';

interface OnChainDataPanelProps {
  uniswapStrategies?: Strategy[];
}

// Generate simulated metrics data
const generateMetricsData = (metrics: string[]) => {
  const data: { [key: string]: any } = {};
  
  metrics.forEach(metric => {
    switch (metric) {
      case 'historical_price':
        data[metric] = {
          current: '$2,647.32',
          change: '+2.4%',
          trend: 'up',
          icon: DollarSign,
          color: 'blue'
        };
        break;
      case 'liquidity_volume':
        data[metric] = {
          current: '$45.8M',
          change: '+12.7%',
          trend: 'up',
          icon: Droplets,
          color: 'green'
        };
        break;
      case 'avg_liquidity_7day':
        data[metric] = {
          current: '$38.2M',
          change: '+8.1%',
          trend: 'up',
          icon: BarChart3,
          color: 'purple'
        };
        break;
      case 'volume_24h':
        data[metric] = {
          current: '$15.6M',
          change: '-3.2%',
          trend: 'down',
          icon: Activity,
          color: 'orange'
        };
        break;
      case 'fees_24h':
        data[metric] = {
          current: '$47.3K',
          change: '+5.8%',
          trend: 'up',
          icon: Fuel,
          color: 'yellow'
        };
        break;
      case 'apr':
        data[metric] = {
          current: '14.2%',
          change: '+1.1%',
          trend: 'up',
          icon: TrendingUp,
          color: 'emerald'
        };
        break;
      default:
        data[metric] = {
          current: 'N/A',
          change: '0%',
          trend: 'neutral',
          icon: Activity,
          color: 'gray'
        };
    }
  });
  
  return data;
};

export function OnChainDataPanel({ uniswapStrategies }: OnChainDataPanelProps) {
  // Extract metrics from Uniswap strategies
  const uniswapMetrics: string[] = [];
  if (uniswapStrategies && uniswapStrategies.length > 0) {
    uniswapStrategies.forEach(strategy => {
      if (strategy.strategy.metrics) {
        uniswapMetrics.push(...strategy.strategy.metrics);
      }
    });
  }

  const hasUniswapData = uniswapMetrics.length > 0;
  const metricsData = hasUniswapData ? generateMetricsData(uniswapMetrics) : {};

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-auto">
      <div className="mb-6">
        <h2>{hasUniswapData ? 'Uniswap V3 Metrics' : 'On-Chain Data Overview'}</h2>
        <p className="text-sm text-muted-foreground">
          {hasUniswapData ? 'Real-time Uniswap liquidity provision metrics' : 'Real-time blockchain metrics'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {hasUniswapData ? (
          // Show Uniswap metrics dynamically
          Object.entries(metricsData).map(([metricKey, metricData]) => {
            const IconComponent = metricData.icon;
            const colorClasses = {
              blue: 'border-blue-500/20 bg-blue-500/10 text-blue-500',
              green: 'border-green-500/20 bg-green-500/10 text-green-500',
              purple: 'border-purple-500/20 bg-purple-500/10 text-purple-500',
              orange: 'border-orange-500/20 bg-orange-500/10 text-orange-500',
              yellow: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500',
              emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
              gray: 'border-gray-500/20 bg-gray-500/10 text-gray-500',
            };
            
            const colorClass = colorClasses[metricData.color as keyof typeof colorClasses] || colorClasses.gray;
            const [borderColor, bgColor, textColor] = colorClass.split(' ');
            
            return (
              <Card key={metricKey} className={`${borderColor} bg-card/50`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {metricKey.replace(/_/g, ' ')}
                      </p>
                      <p className="text-2xl font-bold">{metricData.current}</p>
                      <div className={`flex items-center gap-1 ${
                        metricData.trend === 'up' ? 'text-green-500' : 
                        metricData.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {metricData.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                         metricData.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                         <Activity className="w-4 h-4" />}
                        <span className="text-sm">{metricData.change}</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          // Show default metrics
          <>
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
          </>
        )}
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {hasUniswapData ? 'Pool Information' : 'Market Summary'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {hasUniswapData ? (
                // Show Uniswap pool information
                <>
                  <div>
                    <p className="text-muted-foreground">Pool Pair</p>
                    <p>ETH/USDC</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fee Tier</p>
                    <p>0.3%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Range</p>
                    <p>$2,400 - $2,800</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Position Size</p>
                    <p>$125.4K</p>
                  </div>
                </>
              ) : (
                // Show default market summary
                <>
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
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
