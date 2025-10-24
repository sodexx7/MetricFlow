import React from "react";
import { Strategy } from "../types/finance";

interface StrategiesHandlerProps {
  strategies?: Strategy[];
  onUniswapDetected?: (hasUniswap: boolean) => void;
}

export function StrategiesHandler({
  strategies,
  onUniswapDetected,
}: StrategiesHandlerProps) {
  React.useEffect(() => {
    if (!strategies) {
      onUniswapDetected?.(false);
      return;
    }

    // Check if any strategy is uniswap_v3 or uniswap
    const hasUniswap = strategies.some(
      (strategy) =>
        strategy.strategy.protocol.name === "uniswap_v3" ||
        strategy.strategy.protocol.name === "uniswap"
    );

    console.log("=== STRATEGIES DEBUG ===");
    console.log("All strategies:", strategies);
    console.log("Has Uniswap strategy:", hasUniswap);
    console.log("========================");

    onUniswapDetected?.(hasUniswap);
  }, [strategies, onUniswapDetected]);

  // This component doesn't render anything, it just processes strategies
  return null;
}

export function checkHasUniswapStrategy(strategies?: Strategy[]): boolean {
  if (!strategies) {
    console.log("checkHasUniswapStrategy: No strategies provided");
    return false;
  }

  console.log("checkHasUniswapStrategy: Checking strategies:", strategies);
  
  // Check for various possible Uniswap protocol names
  const hasUniswap = strategies.some((strategy) => {
    const protocolName = strategy.strategy.protocol.name.toLowerCase();
    console.log("Checking protocol:", protocolName);
    
    return protocolName.includes("uniswap") || 
           protocolName === "uniswap_v3" || 
           protocolName === "uniswap";
  });

  console.log("checkHasUniswapStrategy result:", hasUniswap);
  return hasUniswap;
}
