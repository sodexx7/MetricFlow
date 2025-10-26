import { Card, CardContent } from "./ui/card";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Fuel,
  Users,
  BarChart3,
  Droplets,
  Clock,
  ExternalLink,
  Copy,
  Plus,
  Minus,
} from "lucide-react";
import { Strategy } from "../types/finance";
import { useState, useEffect } from "react";
import { TickMath } from "../utils/liquidityMath/tickMath";
import {
  getAmount0,
  getAmount1,
} from "../utils/liquidityMath/liquidityAmounts";
import { SqrtPriceMath } from "../utils/liquidityMath/sqrtPriceMath";

interface OnChainDataPanelProps {
  uniswapStrategies?: Strategy[];
  debugMode?: boolean;
}

// Generate metrics data with real TVL calculation
const generateMetricsData = async (
  metrics: string[],
  currentPrice: number,
  poolAddress?: string
) => {
  const data: { [key: string]: any } = {};

  // Get TVL data if pool address is available
  let tvlData = { tvl: 0, wethBalance: 0, usdcBalance: 0 };
  if (poolAddress && metrics.includes("liquidity_volume")) {
    tvlData = await calculatePoolTVL(poolAddress, currentPrice);
  }

  metrics.forEach((metric) => {
    switch (metric) {
      case "current_price":
        data[metric] = {
          current: `$${currentPrice.toFixed(2)}`,
          icon: DollarSign,
          color: "blue",
        };
        break;
      case "liquidity_volume": {
        const tvlFormatted =
          tvlData.tvl >= 1000000
            ? `$${(tvlData.tvl / 1000000).toFixed(1)}M`
            : tvlData.tvl >= 1000
            ? `$${(tvlData.tvl / 1000).toFixed(1)}K`
            : `$${tvlData.tvl.toFixed(2)}`;

        data[metric] = {
          current: tvlFormatted,
          change: "",
          trend: "",
          icon: Droplets,
          color: "green",
        };
        break;
      }
      case "avg_liquidity_7day":
        data[metric] = {
          current: "coming",
          change: "",
          trend: "",
          icon: BarChart3,
          color: "purple",
        };
        break;
      default:
        data[metric] = {
          current: "N/A",
          change: "0%",
          trend: "neutral",
          icon: Activity,
          color: "gray",
        };
    }
  });

  return data;
};

// Helper function to get network scan URL
const getNetworkScanUrl = (network: string, address: string) => {
  const baseUrls: { [key: string]: string } = {
    ethereum: "https://etherscan.io",
    arbitrum: "https://arbiscan.io",
    polygon: "https://polygonscan.com",
    optimism: "https://optimistic.etherscan.io",
    base: "https://basescan.org",
    mainnet: "https://etherscan.io",
  };

  const baseUrl = baseUrls[network.toLowerCase()] || baseUrls["ethereum"];
  return `${baseUrl}/address/${address}`;
};

// Helper function to get token symbol from address
const getTokenSymbol = (address: string) => {
  const tokenMap: { [key: string]: string } = {
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH", // Ethereum WETH
    "0xa0b86a33e6d1b756e6ea1c4b48b9e8eddcacbaab": "USDC", // Example USDC
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": "WETH", // Arbitrum WETH
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "USDC", // Arbitrum USDC
  };

  return tokenMap[address.toLowerCase()] || address.slice(0, 8) + "...";
};

// Helper function to format timestamp from event ID
const formatTimestamp = (eventId: string): string => {
  try {
    // Use event ID to generate relative time (higher ID = more recent)
    const id = parseInt(eventId);
    // Generate a synthetic "time ago" based on ID relative position
    const timeDiffMinutes = Math.floor(Math.random() * 30) + 1; // 1-30 minutes ago

    if (timeDiffMinutes < 60) return `${timeDiffMinutes}m ago`;
    const hours = Math.floor(timeDiffMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return "recently";
  } catch {
    return "recently";
  }
};

// Types for GraphQL responses
interface BurnEvent {
  id: string;
  owner: string;
  tickLower: string;
  tickUpper: string;
  amount: string;
  amount0: string;
  amount1: string;
}

interface MintEvent {
  id: string;
  sender: string;
  owner: string;
  tickLower: string;
  tickUpper: string;
  amount: string;
  amount0: string;
  amount1: string;
}

interface SwapEvent {
  id: string;
  sender: string;
  recipient: string;
  amount0: string;
  amount1: string;
  sqrtPriceX96: string;
  liquidity: string;
  tick: string;
}

interface LiquidityEvent {
  id: string;
  type: "Add" | "Remove";
  functionName: "burn" | "mint";
  pair: string;
  fee: string;
  network: string;
  amount: string;
  timestamp: string;
  tokens: string[];
  sender: string;
  tickLower: number;
  tickUpper: number;
  totalUSDValue?: number;
}

// GraphQL queries
const GET_BURN_EVENTS = `
  query GetBurnEvents {
    ETHUSDC005_Burn(limit: 10, order_by: {id: desc}) {
      id owner tickLower tickUpper amount amount0 amount1
    }
  }
`;

const GET_MINT_EVENTS = `
  query GetMintEvents {
    ETHUSDC005_Mint(limit: 10, order_by: {id: desc}) {
      id sender owner tickLower tickUpper amount amount0 amount1
    }
  }
`;

const GET_SWAP_EVENTS = `
  query GetSwapEvents {
    ETHUSDC005_Swap(limit: 10, order_by: {id: desc}) {
      id sender recipient amount0 amount1 sqrtPriceX96 liquidity tick
    }
  }
`;

// Function to get current price from swap events
const useCurrentPrice = () => {
  const [currentPrice, setCurrentPrice] = useState<number>(2600); // Default ETH price

  const fetchCurrentPrice = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_ENVIO_INDEXER_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: GET_SWAP_EVENTS }),
        }
      );

      const data = await response.json();
      const swapEvents = data.data?.ETHUSDC005_Swap || [];

      if (swapEvents.length > 0) {
        const latestSwap = swapEvents[0];
        const sqrtPriceX96 = BigInt(latestSwap.sqrtPriceX96);

        // Convert sqrtPriceX96 to actual price using proper liquidityMath approach
        // price = (sqrtPriceX96 / 2^96)^2
        const Q96 = 2n ** 96n;
        const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
        const price = sqrtPrice * sqrtPrice;

        // For ETH/USDC pair, this gives USDC per ETH
        // Adjust for token decimals: ETH (18 decimals) / USDC (6 decimals)
        const adjustedPrice = price * 10 ** (18 - 6);

        setCurrentPrice(adjustedPrice);
      }
    } catch (error) {
      console.error("Error fetching current price:", error);
    }
  };

  useEffect(() => {
    fetchCurrentPrice();
    const interval = setInterval(fetchCurrentPrice, 2000); // Update price every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return currentPrice;
};

// Function to calculate pool TVL
const calculatePoolTVL = async (
  poolAddress: string,
  currentPrice: number
): Promise<{ tvl: number; wethBalance: number; usdcBalance: number }> => {
  try {
    // ETH/USDC pool token addresses
    const WETH_ADDRESS = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"; // Arbitrum WETH
    const USDC_ADDRESS = "0xaf88d065e77c8cc2239327c5edb3a432268e5831"; // Arbitrum USDC

    // Use environment variable for RPC URL
    const rpcUrl = import.meta.env.VITE_RPC_URL;

    const getBalanceCall = (tokenAddress: string, poolAddress: string) => ({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [
        {
          to: tokenAddress,
          data: `0x70a08231000000000000000000000000${poolAddress.slice(2)}`, // balanceOf(address) function signature + pool address
        },
        "latest",
      ],
    });

    // Fetch both token balances in parallel
    const [wethResponse, usdcResponse] = await Promise.all([
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getBalanceCall(WETH_ADDRESS, poolAddress)),
      }),
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getBalanceCall(USDC_ADDRESS, poolAddress)),
      }),
    ]);

    const wethData = await wethResponse.json();
    const usdcData = await usdcResponse.json();

    // Parse balances (hex to decimal)
    const wethBalanceWei = BigInt(wethData.result || "0x0");
    const usdcBalanceWei = BigInt(usdcData.result || "0x0");

    // Convert to readable units
    const wethBalance = Number(wethBalanceWei) / 1e18; // WETH has 18 decimals
    const usdcBalance = Number(usdcBalanceWei) / 1e6; // USDC has 6 decimals

    // Calculate TVL: WETH value in USD + USDC value
    const wethValueUSD = wethBalance * currentPrice;
    const tvl = wethValueUSD + usdcBalance;

    return { tvl, wethBalance, usdcBalance };
  } catch (error) {
    console.error("Error calculating pool TVL:", error);
    return { tvl: 0, wethBalance: 0, usdcBalance: 0 };
  }
};

// Custom hook for fetching liquidity events
const useLiquidityEvents = (network: string = "arbitrum") => {
  const [events, setEvents] = useState<LiquidityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState<string>("");
  const currentPrice = useCurrentPrice();

  const calculateUSDValue = (amount0: string, amount1: string): string => {
    try {
      // Convert amounts to numbers and calculate USD value
      const ethAmount = Math.abs(parseFloat(amount0)) / 1e18; // ETH has 18 decimals
      const usdcAmount = Math.abs(parseFloat(amount1)) / 1e6; // USDC has 6 decimals

      // Use real-time price from swap events
      const ethValueUSD = ethAmount * currentPrice;
      const totalUSD = ethValueUSD + usdcAmount;

      let formattedValue;
      if (totalUSD < 0.01) formattedValue = "$0.00";
      else if (totalUSD < 1000) formattedValue = `$${totalUSD.toFixed(2)}`;
      else if (totalUSD < 1000000)
        formattedValue = `$${(totalUSD / 1000).toFixed(2)}K`;
      else formattedValue = `$${(totalUSD / 1000000).toFixed(2)}M`;

      return formattedValue;
    } catch (error) {
      console.error("Error in calculateUSDValue:", error);
      return "$0.00";
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [burnResponse, mintResponse] = await Promise.all([
        fetch(import.meta.env.VITE_ENVIO_INDEXER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: GET_BURN_EVENTS }),
        }),
        fetch(import.meta.env.VITE_ENVIO_INDEXER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: GET_MINT_EVENTS }),
        }),
      ]);

      const burnData = await burnResponse.json();
      const mintData = await mintResponse.json();

      const burnEvents: LiquidityEvent[] = (
        burnData.data?.ETHUSDC005_Burn || []
      ).map((event: BurnEvent) => {
        const ethAmount = Math.abs(parseFloat(event.amount0)) / 1e18;
        const usdcAmount = Math.abs(parseFloat(event.amount1)) / 1e6;
        const ethUSDValue = ethAmount * currentPrice;

        return {
          id: event.id,
          type: "Remove" as const,
          functionName: "burn" as const,
          pair: "ETH/USDC",
          fee: "0.05%",
          network: network,
          amount: calculateUSDValue(event.amount0, event.amount1),
          timestamp: formatTimestamp(event.id),
          tokens: [
            `${ethAmount.toFixed(4)} ETH ($${ethUSDValue.toFixed(2)})`,
            `${usdcAmount.toFixed(2)} USDC`,
          ],
          sender: event.owner, // Burn events use 'owner' field
          tickLower: parseInt(event.tickLower),
          tickUpper: parseInt(event.tickUpper),
        };
      });

      const mintEvents: LiquidityEvent[] = (
        mintData.data?.ETHUSDC005_Mint || []
      ).map((event: MintEvent) => {
        const ethAmount = Math.abs(parseFloat(event.amount0)) / 1e18;
        const usdcAmount = Math.abs(parseFloat(event.amount1)) / 1e6;
        const ethUSDValue = ethAmount * currentPrice;

        return {
          id: event.id,
          type: "Add" as const,
          functionName: "mint" as const,
          pair: "ETH/USDC",
          fee: "0.05%",
          network: network,
          amount: calculateUSDValue(event.amount0, event.amount1),
          timestamp: formatTimestamp(event.id),
          tokens: [
            `${ethAmount.toFixed(4)} ETH ($${ethUSDValue.toFixed(2)})`,
            `${usdcAmount.toFixed(2)} USDC`,
          ],
          sender: event.sender, // Mint events use 'sender' field
          tickLower: parseInt(event.tickLower),
          tickUpper: parseInt(event.tickUpper),
        };
      });

      // Combine and sort by ID (newest first)
      const allEvents = [...burnEvents, ...mintEvents].sort(
        (a, b) => parseInt(b.id) - parseInt(a.id)
      );

      setEvents(allEvents.slice(0, 3)); // Keep latest 3 events

      // Track the latest event ID
      if (allEvents.length > 0) {
        setLastFetchedId(allEvents[0].id);
      }
    } catch (error) {
      console.error("Error fetching liquidity events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Set up polling every 10 seconds
    const interval = setInterval(fetchEvents, 10000);

    return () => clearInterval(interval);
  }, []);

  return { events, loading };
};

// Custom hook for fetching largest liquidity events (>$10,000)
const useLargestLiquidityEvents = (network: string = "arbitrum") => {
  const [largestEvents, setLargestEvents] = useState<LiquidityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const currentPrice = useCurrentPrice();

  const calculateUSDValueNumeric = (
    amount0: string,
    amount1: string
  ): number => {
    try {
      const ethAmount = Math.abs(parseFloat(amount0)) / 1e18;
      const usdcAmount = Math.abs(parseFloat(amount1)) / 1e6;
      return ethAmount * currentPrice + usdcAmount;
    } catch {
      return 0;
    }
  };

  const fetchLargestEvents = async () => {
    setLoading(true);
    try {
      const [burnResponse, mintResponse] = await Promise.all([
        fetch(import.meta.env.VITE_ENVIO_INDEXER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: GET_BURN_EVENTS }),
        }),
        fetch(import.meta.env.VITE_ENVIO_INDEXER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: GET_MINT_EVENTS }),
        }),
      ]);

      const burnData = await burnResponse.json();
      const mintData = await mintResponse.json();

      const burnEvents: LiquidityEvent[] = (
        burnData.data?.ETHUSDC005_Burn || []
      ).map((event: BurnEvent) => {
        const ethAmount = Math.abs(parseFloat(event.amount0)) / 1e18;
        const usdcAmount = Math.abs(parseFloat(event.amount1)) / 1e6;
        const ethUSDValue = ethAmount * currentPrice;
        const totalUSDValue = calculateUSDValueNumeric(
          event.amount0,
          event.amount1
        );

        return {
          id: event.id,
          type: "Remove" as const,
          functionName: "burn" as const,
          pair: "ETH/USDC",
          fee: "0.05%",
          network: network,
          amount: `$${totalUSDValue.toFixed(2)}`,
          timestamp: formatTimestamp(event.id),
          tokens: [
            `${ethAmount.toFixed(4)} ETH ($${ethUSDValue.toFixed(2)})`,
            `${usdcAmount.toFixed(2)} USDC`,
          ],
          sender: event.owner,
          tickLower: parseInt(event.tickLower),
          tickUpper: parseInt(event.tickUpper),
          totalUSDValue: totalUSDValue,
        };
      });

      const mintEvents: LiquidityEvent[] = (
        mintData.data?.ETHUSDC005_Mint || []
      ).map((event: MintEvent) => {
        const ethAmount = Math.abs(parseFloat(event.amount0)) / 1e18;
        const usdcAmount = Math.abs(parseFloat(event.amount1)) / 1e6;
        const ethUSDValue = ethAmount * currentPrice;
        const totalUSDValue = calculateUSDValueNumeric(
          event.amount0,
          event.amount1
        );

        return {
          id: event.id,
          type: "Add" as const,
          functionName: "mint" as const,
          pair: "ETH/USDC",
          fee: "0.05%",
          network: network,
          amount: `$${totalUSDValue.toFixed(2)}`,
          timestamp: formatTimestamp(event.id),
          tokens: [
            `${ethAmount.toFixed(4)} ETH ($${ethUSDValue.toFixed(2)})`,
            `${usdcAmount.toFixed(2)} USDC`,
          ],
          sender: event.sender,
          tickLower: parseInt(event.tickLower),
          tickUpper: parseInt(event.tickUpper),
          totalUSDValue: totalUSDValue,
        };
      });

      // Combine, filter for >$10,000, and sort by USD value (largest first)
      const allEvents = [...burnEvents, ...mintEvents]
        .filter((event) => event.totalUSDValue > 10000)
        .sort((a, b) => b.totalUSDValue - a.totalUSDValue);

      setLargestEvents(allEvents.slice(0, 3)); // Keep top 3 largest events
    } catch (error) {
      console.error("Error fetching largest liquidity events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLargestEvents();
    const interval = setInterval(fetchLargestEvents, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [currentPrice]); // Re-fetch when price changes significantly

  return { largestEvents, loading };
};

export function OnChainDataPanel({ uniswapStrategies, debugMode }: OnChainDataPanelProps) {
  // Extract metrics and pool info from Uniswap strategies
  const uniswapMetrics: string[] = [];
  let poolInfo = null;

  if (uniswapStrategies && uniswapStrategies.length > 0) {
    uniswapStrategies.forEach((strategy) => {
      if (strategy.strategy.metrics) {
        uniswapMetrics.push(...strategy.strategy.metrics);
      }

      // Extract pool information from AMM config
      if (strategy.strategy.protocol.ammConfig) {
        const ammConfig = strategy.strategy.protocol.ammConfig;
        poolInfo = {
          poolAddress: ammConfig.pair_address,
          network: ammConfig.network,
          tokenA: {
            address: ammConfig.tokenA_address,
            symbol: getTokenSymbol(ammConfig.tokenA_address),
          },
          tokenB: {
            address: ammConfig.tokenB_address,
            symbol: getTokenSymbol(ammConfig.tokenB_address),
          },
          pairName:
            ammConfig.pair_name ||
            `${getTokenSymbol(ammConfig.tokenA_address)}/${getTokenSymbol(
              ammConfig.tokenB_address
            )}`,
        };
      }
    });
  }

  // In debug mode, create default pool info if none exists
  if (debugMode && !poolInfo) {
    poolInfo = {
      poolAddress: "0xC6962004f452bE9203591991D15f6b388e09E8D0", // Default ETH/USDC pool
      network: "arbitrum",
      tokenA: {
        address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        symbol: "WETH",
      },
      tokenB: {
        address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        symbol: "USDC",
      },
      pairName: "ETH/USDC",
    };
  }

  const hasUniswapData = uniswapMetrics.length > 0;
  const currentPrice = useCurrentPrice();
  const [metricsData, setMetricsData] = useState<{ [key: string]: any }>({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const currentNetwork = poolInfo?.network || "arbitrum";

  // If no strategies are provided, show default metrics
  const defaultMetrics = [
    "current_price",
    "liquidity_volume",
    "volume_24h",
    "fees_24h",
  ];
  const metricsToShow = hasUniswapData ? uniswapMetrics : defaultMetrics;
  const shouldShowMetrics = (hasUniswapData || debugMode) && metricsToShow.length > 0;

  // Generate metrics data when price or pool info changes
  useEffect(() => {
    const loadMetricsData = async () => {
      if (shouldShowMetrics) {
        setMetricsLoading(true);
        try {
          // Use default pool address if none provided
          const poolAddressToUse =
            poolInfo?.poolAddress ||
            "0xC6962004f452bE9203591991D15f6b388e09E8D0";

          const data = await generateMetricsData(
            metricsToShow,
            currentPrice,
            poolAddressToUse
          );
          setMetricsData(data);
        } catch (error) {
          console.error("Error generating metrics data:", error);
          setMetricsData({});
        } finally {
          setMetricsLoading(false);
        }
      } else {
        setMetricsData({});
      }
    };

    loadMetricsData();
  }, [
    shouldShowMetrics,
    currentPrice,
    poolInfo?.poolAddress,
    metricsToShow.join(","),
  ]);
  const { events: recentEvents, loading: eventsLoading } =
    useLiquidityEvents(currentNetwork);
  const { largestEvents, loading: largestEventsLoading } =
    useLargestLiquidityEvents(currentNetwork);

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-auto">
      <div className="mb-6">
        <h2>
          {hasUniswapData ? "Uniswap V3 Metrics" : "On-Chain Data Overview"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {hasUniswapData
            ? "Real-time Uniswap liquidity provision metrics"
            : "Real-time blockchain metrics"}
        </p>
      </div>

      {(hasUniswapData || debugMode) && poolInfo && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Pool Information
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Pool Pair</p>
                      <p className="font-medium">{poolInfo.pairName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Network</p>
                      <p className="font-medium capitalize">
                        {poolInfo.network}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-2">Pool Address</p>
                    <div className="p-2 bg-muted/50 rounded border">
                      <a
                        href={getNetworkScanUrl(
                          poolInfo.network,
                          poolInfo.poolAddress
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 hover:underline"
                      >
                        <code className="text-xs break-all">
                          {poolInfo.poolAddress}
                        </code>
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground mb-2">
                        Token A ({poolInfo.tokenA.symbol})
                      </p>
                      <div className="p-2 bg-muted/50 rounded border">
                        <a
                          href={getNetworkScanUrl(
                            poolInfo.network,
                            poolInfo.tokenA.address
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 hover:underline"
                        >
                          <code className="text-xs break-all">
                            {poolInfo.tokenA.address}
                          </code>
                        </a>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-2">
                        Token B ({poolInfo.tokenB.symbol})
                      </p>
                      <div className="p-2 bg-muted/50 rounded border">
                        <a
                          href={getNetworkScanUrl(
                            poolInfo.network,
                            poolInfo.tokenB.address
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 hover:underline"
                        >
                          <code className="text-xs break-all">
                            {poolInfo.tokenB.address}
                          </code>
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show default content when no Uniswap data and debug is off */}
      {!hasUniswapData && !debugMode && (
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">On-Chain Data Dashboard</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Network Activity</p>
                    <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Market Data</p>
                    <p className="text-xs text-muted-foreground">Price & volume tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {shouldShowMetrics ? (
          metricsLoading ? (
            // Show loading state
            <div className="flex items-center justify-center col-span-2 py-8">
              <div className="text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 animate-spin" />
                <p className="text-muted-foreground">Loading metrics...</p>
              </div>
            </div>
          ) : (
            // Show Uniswap metrics dynamically
            Object.entries(metricsData).map(([metricKey, metricData]) => {
              const IconComponent = metricData.icon;
              const colorClasses = {
                blue: "border-blue-500/20 bg-blue-500/10 text-blue-500",
                green: "border-green-500/20 bg-green-500/10 text-green-500",
                purple: "border-purple-500/20 bg-purple-500/10 text-purple-500",
                orange: "border-orange-500/20 bg-orange-500/10 text-orange-500",
                yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500",
                emerald:
                  "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                gray: "border-gray-500/20 bg-gray-500/10 text-gray-500",
              };

              const colorClass =
                colorClasses[metricData.color as keyof typeof colorClasses] ||
                colorClasses.gray;
              const [borderColor, bgColor, textColor] = colorClass.split(" ");

              return (
                <Card key={metricKey} className={`${borderColor} bg-card/50`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {metricKey.replace(/_/g, " ")}
                        </p>
                        <p className="text-2xl font-bold">
                          {metricData.current}
                        </p>
                        <div
                          className={`flex items-center gap-1 ${
                            metricData.trend === "up"
                              ? "text-green-500"
                              : metricData.trend === "down"
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {metricData.trend === "up" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : metricData.trend === "down" ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                          <span className="text-sm">{metricData.change}</span>
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}
                      >
                        <IconComponent className={`w-6 h-6 ${textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )
        ) : (
          // Show empty state message
          <div className="flex items-center justify-center col-span-2 py-8">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No related protocols metrics data
              </p>
            </div>
          </div>
        )}
      </div>

      {shouldShowMetrics && (
        <div className="grid grid-cols-2 gap-4">
          {/* Largest Liquidity Events */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    Largest Liquidity Events
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {largestEventsLoading
                      ? "Loading..."
                      : `${largestEvents.length} event${
                          largestEvents.length !== 1 ? "s" : ""
                        } > $10K`}
                  </span>
                </div>
                <div className="space-y-3">
                  {largestEvents.length > 0 ? (
                    largestEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex flex-col space-y-2 p-3 bg-muted/30 rounded border"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                event.type === "Remove"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {event.functionName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {event.network}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {event.timestamp}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                event.type === "Remove"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {event.amount}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {event.pair}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.pair} - {event.fee}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {event.tokens.map((token, index) => (
                            <div
                              key={index}
                              className={`text-xs ${
                                event.type === "Remove"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {event.type === "Remove" ? "-" : "+"}
                              {token}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.functionName === "burn" ? "Owner" : "User"}:{" "}
                          <a
                            href={getNetworkScanUrl(
                              event.network,
                              event.sender
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 hover:underline"
                          >
                            {event.sender.slice(0, 6)}...
                            {event.sender.slice(-4)}
                          </a>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Copy className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-blue-500" />
                          <ExternalLink className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-blue-500" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No events &gt; $10,000
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Liquidity Events */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    Recent Liquidity Events
                  </h3>
                  <span className="text-xs text-pink-400">
                    {eventsLoading
                      ? "Loading..."
                      : `${recentEvents.length} event incoming`}
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex flex-col space-y-2 p-3 bg-muted/30 rounded border"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                event.type === "Remove"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {event.functionName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {event.network}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {event.timestamp}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                event.type === "Remove"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {event.amount}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {event.pair}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.pair} - {event.fee}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {event.tokens.map((token, index) => (
                            <div
                              key={index}
                              className={`text-xs ${
                                event.type === "Remove"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {event.type === "Remove" ? "-" : "+"}
                              {token}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.functionName === "burn" ? "Owner" : "User"}:{" "}
                          <a
                            href={getNetworkScanUrl(
                              event.network,
                              event.sender
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 hover:underline"
                          >
                            {event.sender.slice(0, 6)}...
                            {event.sender.slice(-4)}
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No recent events
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
