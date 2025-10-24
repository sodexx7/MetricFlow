import { encodeFunctionData, numberToHex, parseEther, formatEther, isAddress, createPublicClient, http } from "viem";
import { mainnet, arbitrum } from "viem/chains";
import { writeContract, readContract } from "wagmi/actions";
import { config } from "@rainbow-me/rainbowkit";

// Contract addresses - update these based on your deployment
export const contractAddresses = {
  smartContract: "0x33D2293adE167F631c01DB278a45e70ECc5e4778",
  usdc: "0x97dBc1b214d66eC151850961Fe48ADBE9987f583",
  entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
} as const;

// Types
export interface GasEstimate {
  preVerificationGas: string;
  verificationGasLimit: string;
  callGasLimit: string;
  paymasterVerificationGasLimit?: string;
  paymasterPostOpGasLimit?: string;
}

export interface TransactionData {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
}

// Address validation
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

// Format utilities
export function formatWeiToEther(wei: string | bigint): string {
  return formatEther(BigInt(wei));
}

export function formatCurrency(value: string | number, decimals: number = 4): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Gas price utilities
export async function fetchGasPrice(rpcUrl: string) {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gas price fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching gas price:", error);
    throw error;
  }
}

// Blockchain data helpers
export function calculateGasCost(gasUsed: string, gasPrice: string): string {
  const cost = BigInt(gasUsed) * BigInt(gasPrice);
  return formatEther(cost);
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  return parseEther(amount) / BigInt(10 ** (18 - decimals));
}

// API utilities
export async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (i === maxRetries - 1) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

// Data validation
export function validateTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function validateBlockNumber(blockNumber: string | number): boolean {
  const num = typeof blockNumber === 'string' ? parseInt(blockNumber) : blockNumber;
  return Number.isInteger(num) && num >= 0;
}

// Error handling
export class BlockchainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BlockchainError';
  }
}

export function handleRPCError(error: any): string {
  if (error?.message) {
    if (error.message.includes('insufficient funds')) return 'Insufficient funds for transaction';
    if (error.message.includes('gas too low')) return 'Gas limit too low';
    if (error.message.includes('nonce')) return 'Invalid transaction nonce';
    return error.message;
  }
  return 'Unknown blockchain error occurred';
}

// Local storage utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

// URL utilities
export function buildExplorerUrl(hash: string, type: 'tx' | 'address' | 'block' = 'tx', network: string = 'ethereum'): string {
  const explorers = {
    ethereum: 'https://etherscan.io',
    arbitrum: 'https://arbiscan.io',
    polygon: 'https://polygonscan.com',
  };
  
  const baseUrl = explorers[network as keyof typeof explorers] || explorers.ethereum;
  return `${baseUrl}/${type}/${hash}`;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Promise utilities
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

// Function to encode smart contract function calls
export function encodeUniswapSwapAndMint(
  user: `0x${string}`,
  totalUsdcAmount: bigint,
  slippagePercent: bigint,
  abi: any[]
): `0x${string}` {
  return encodeFunctionData({
    abi,
    functionName: "uniswapSwapAndMint",
    args: [user, totalUsdcAmount, slippagePercent],
  });
}