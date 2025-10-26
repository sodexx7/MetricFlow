import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Fuel,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const priceData = [
  { time: "00:00", price: 2850, volume: 1200 },
  { time: "04:00", price: 2920, volume: 1450 },
  { time: "08:00", price: 2880, volume: 1380 },
  { time: "12:00", price: 3050, volume: 2100 },
  { time: "16:00", price: 3120, volume: 2350 },
  { time: "20:00", price: 3180, volume: 1980 },
  { time: "24:00", price: 3250, volume: 2200 },
];

const gasData = [
  { time: "00:00", gas: 25 },
  { time: "04:00", gas: 18 },
  { time: "08:00", gas: 32 },
  { time: "12:00", gas: 45 },
  { time: "16:00", gas: 38 },
  { time: "20:00", gas: 28 },
  { time: "24:00", gas: 22 },
];

const liquidityData = [
  { name: "Uniswap", value: 8500 },
  { name: "Curve", value: 6200 },
  { name: "Balancer", value: 4300 },
  { name: "SushiSwap", value: 3800 },
  { name: "PancakeSwap", value: 2900 },
];

const transactionData = [
  { time: "00:00", txCount: 1200, success: 1150 },
  { time: "04:00", txCount: 980, success: 945 },
  { time: "08:00", txCount: 1450, success: 1380 },
  { time: "12:00", txCount: 2100, success: 2050 },
  { time: "16:00", txCount: 1890, success: 1820 },
  { time: "20:00", txCount: 1650, success: 1590 },
  { time: "24:00", txCount: 1400, success: 1355 },
];

interface DataDetailsPageProps {
  onBack: () => void;
}

export function DataDetailsPage({ onBack }: DataDetailsPageProps) {
  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1>On-Chain Data Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive blockchain metrics and insights
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Live
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
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

        {/* Main Charts */}
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="price">Price & Volume</TabsTrigger>
            <TabsTrigger value="gas">Gas Fees</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>ETH/USD Price Chart (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={priceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148, 163, 184, 0.1)"
                      />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#131620",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trading Volume (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={priceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148, 163, 184, 0.1)"
                      />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#131620",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-xl">$390.2B</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h High</p>
                    <p className="text-xl">$3,285</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Low</p>
                    <p className="text-xl">$2,845</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TVL</p>
                    <p className="text-xl">$52.8B</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gas" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gas Fee Trends (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={gasData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.1)"
                    />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#131620",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gas"
                      stroke="#f97316"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gas Fee Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-500 border-green-500/30"
                    >
                      Low
                    </Badge>
                    <span>Standard Transfer</span>
                  </div>
                  <span>18 Gwei (~$8.50)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                    >
                      Medium
                    </Badge>
                    <span>Average Transaction</span>
                  </div>
                  <span>22 Gwei (~$10.40)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-red-500/20 text-red-500 border-red-500/30"
                    >
                      High
                    </Badge>
                    <span>Priority Transaction</span>
                  </div>
                  <span>35 Gwei (~$16.50)</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidity" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Top DEX Liquidity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={liquidityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.1)"
                    />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#131620",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liquidity Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Liquidity
                    </p>
                    <p className="text-xl">$25.7B</p>
                    <p className="text-sm text-green-500">+12.5% (24h)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Pool Size
                    </p>
                    <p className="text-xl">$5.14B</p>
                    <p className="text-sm text-green-500">+8.2% (24h)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Pools
                    </p>
                    <p className="text-xl">5,234</p>
                    <p className="text-sm text-green-500">+3.1% (24h)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Activity (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={transactionData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.1)"
                    />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#131620",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="txCount"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Total Transactions"
                    />
                    <Area
                      type="monotone"
                      dataKey="success"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="Successful"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Transactions
                    </p>
                    <p className="text-xl">1.2M</p>
                    <p className="text-sm text-green-500">+5.8% (24h)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Success Rate
                    </p>
                    <p className="text-xl">96.8%</p>
                    <p className="text-sm text-green-500">+0.3% (24h)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg. Tx Value
                    </p>
                    <p className="text-xl">$10,420</p>
                    <p className="text-sm text-green-500">+2.1% (24h)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Txs</p>
                    <p className="text-xl">12,450</p>
                    <p className="text-sm text-red-500">+15.2% (5m)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
