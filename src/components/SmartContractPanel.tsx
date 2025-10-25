import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  CheckCircle2,
  Loader2,
  Shield,
  Droplets,
  Calculator,
} from "lucide-react";
import { parseEther } from "viem";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { encodeUniswapSwapAndMint } from "../utils/helper";

import usdcContract from "../../deployments/contracts/USDC.json";
import smartAccountContract from "../../deployments/contracts/smartcontract.json";
import addresses from "../../deployments/arbitrum-mainnet/addresses.json";

type TransactionStatus = "idle" | "pending" | "success" | "failed";

interface EstimateResult {
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
}

export function SmartContractPanel() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [approveAmount, setApproveAmount] = useState("10");
  const [swapAmount, setSwapAmount] = useState("10");
  const [slippagePercent, setSlippagePercent] = useState("10");
  const [approveStatus, setApproveStatus] = useState<TransactionStatus>("idle");
  const [swapLpStatus, setSwapLpStatus] = useState<TransactionStatus>("idle");
  const [estimateStatus, setEstimateStatus] =
    useState<TransactionStatus>("idle");
  const [approveTxHash, setApproveTxHash] = useState("");
  const [swapLpTxHash, setSwapLpTxHash] = useState("");
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(
    null
  );
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [gasPriceData, setGasPriceData] = useState<any>(null);

  const usdcAddress = addresses.contracts.USDC.address;
  const smartAccountAddress = addresses.contracts.SmartAccount.address;
  const approveAbi = usdcContract.abi;
  const uniswapSwapAndMintAbi = smartAccountContract.abi;

  // Wagmi contract write hook for USDC approve
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  // Wait for approve transaction confirmation
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  // Update approve status based on wagmi hook states
  useEffect(() => {
    if (isApprovePending) {
      setApproveStatus("pending");
    } else if (approveError) {
      setApproveStatus("failed");
      console.error("Approve error:", approveError);
    } else if (isApproveConfirmed && approveHash) {
      setApproveStatus("success");
      setApproveTxHash(approveHash);
    }
  }, [isApprovePending, approveError, isApproveConfirmed, approveHash]);

  const handleApprove = async () => {
    if (!isConnected || !connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setApproveStatus("pending");
      setApproveTxHash("");

      // Convert amount to wei (USDC has 6 decimals)
      const amount = BigInt(parseFloat(approveAmount) * 1e6);

      console.log("=== APPROVE DEBUG INFO ===");
      console.log("Connected Address (user):", connectedAddress);
      console.log("USDC Contract Address:", usdcAddress);
      console.log("Smart Contract Address (spender):", smartAccountAddress);
      console.log("Approve Amount (input):", approveAmount);
      console.log("Approve Amount (with decimals):", amount.toString());
      console.log("========================");

      // Call USDC approve function with wagmi
      writeApprove({
        address: usdcAddress as `0x${string}`,
        abi: approveAbi,
        functionName: "approve",
        args: [smartAccountAddress, amount],
      });
    } catch (error) {
      console.error("Approve failed:", error);
      setApproveStatus("failed");
    }
  };

  const handleSwapLp = async () => {
    setSwapLpStatus("pending");
    setSwapLpTxHash("");
    setTokenId(null);

    const url = import.meta.env.VITE_PIMLICO_URL as string;

    try {
      // Validate inputs (same as estimate)
      if (!connectedAddress || !isConnected) {
        throw new Error("Please connect your wallet first");
      }
      if (!swapAmount || parseFloat(swapAmount) <= 0) {
        throw new Error("Valid swap amount is required");
      }
      if (!slippagePercent || parseFloat(slippagePercent) <= 0) {
        throw new Error("Valid slippage percentage is required");
      }

      // Check allowance (same as estimate)
      const currentAllowance = await checkAllowance();
      const requiredAmount = BigInt(parseFloat(swapAmount) * 1e6);

      if (currentAllowance < requiredAmount) {
        throw new Error(
          `Insufficient allowance. Please approve more USDC first.`
        );
      }

      // Get current nonce from EntryPoint
      const currentNonce = await getNonceFromEntryPoint();

      // Get gas price
      const gasPriceResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "pimlico_getUserOperationGasPrice",
          params: [],
          id: 1,
        }),
      });
      const gasPriceData = await gasPriceResponse.json();
      const fastGasPrice = gasPriceData.result.fast;

      // Generate call data (same as estimate)
      const usdcAmount = BigInt(parseFloat(swapAmount) * 1e6);
      const callData = encodeUniswapSwapAndMint(
        connectedAddress,
        usdcAmount,
        BigInt(slippagePercent),
        uniswapSwapAndMintAbi
      );

      // First estimate gas to get proper parameters
      const estimateRequest = {
        jsonrpc: "2.0",
        method: "eth_estimateUserOperationGas",
        params: [
          {
            sender: smartAccountAddress,
            nonce: numberToHex(currentNonce),
            factory: null,
            factoryData: "0x0",
            callData: callData,
            callGasLimit: "0x0",
            verificationGasLimit: "0x0",
            preVerificationGas: "0x0",
            maxPriorityFeePerGas: fastGasPrice.maxPriorityFeePerGas,
            maxFeePerGas: fastGasPrice.maxFeePerGas,
            paymaster: null,
            paymasterVerificationGasLimit: null,
            paymasterPostOpGasLimit: null,
            paymasterData: null,
            signature: "0x0",
          },
          "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        ],
        id: 1,
      };

      const estimateResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estimateRequest),
      });

      const estimateResult = await estimateResponse.json();

      if (estimateResult.error) {
        throw new Error(
          `Gas estimation failed: ${estimateResult.error.message}`
        );
      }

      const gasEstimate = estimateResult.result;

      // Create UserOperation with estimated gas parameters
      const userOperation = {
        sender: smartAccountAddress,
        nonce: numberToHex(currentNonce),
        factory: null,
        factoryData: "0x0",
        callData: callData,
        callGasLimit: gasEstimate.callGasLimit,
        verificationGasLimit: gasEstimate.verificationGasLimit,
        preVerificationGas: gasEstimate.preVerificationGas,
        maxPriorityFeePerGas: fastGasPrice.maxPriorityFeePerGas,
        maxFeePerGas: fastGasPrice.maxFeePerGas,
        paymaster: null,
        paymasterVerificationGasLimit: null,
        paymasterPostOpGasLimit: null,
        paymasterData: null,
        signature: "0x0",
      };

      // Submit UserOperation
      const submitResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_sendUserOperation",
          params: [userOperation, "0x0000000071727De22E5E9d8BAf0edAc6f37da032"],
          id: 1,
        }),
      });

      const result = await submitResponse.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      const userOpHash = result.result;
      setSwapLpTxHash(userOpHash);
      setSwapLpStatus("success");

      // Wait for UserOperation to be processed and extract token ID
      setTimeout(async () => {
        try {
          const extractedTokenId = await getTokenIdFromUserOp(userOpHash);
          if (extractedTokenId) {
            setTokenId(extractedTokenId);
          }
        } catch (error) {
          console.error("Failed to extract token ID:", error);
        }
      }, 5000); // Wait 5 seconds for the UserOp to be processed
    } catch (error) {
      console.error("Swap + LP failed:", error);
      setSwapLpStatus("failed");
    }
  };

  const numberToHex = (num: bigint): string => {
    return `0x${num.toString(16)}`;
  };

  // Function to extract token ID from UserOperation receipt
  const getTokenIdFromUserOp = async (userOpHash: string): Promise<string | null> => {
    try {
      const url = import.meta.env.VITE_PIMLICO_URL as string;
      
      // Get UserOperation receipt
      const receiptResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getUserOperationReceipt",
          params: [userOpHash],
          id: 1,
        }),
      });

      const receiptResult = await receiptResponse.json();
      
      if (receiptResult.error || !receiptResult.result) {
        console.log("UserOperation not yet processed or error:", receiptResult.error);
        return null;
      }

      const receipt = receiptResult.result;
      const actualTxHash = receipt.receipt?.transactionHash;
      
      if (!actualTxHash) {
        console.log("No transaction hash found in receipt");
        return null;
      }

      // Get the transaction receipt to parse logs
      const txReceiptResponse = await fetch(
        `https://arb-mainnet.g.alchemy.com/v2/wWCcLJyDISJ25dvLZvCzCK9wKVVI7HPt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [actualTxHash],
            id: 1,
          }),
        }
      );

      const txReceiptResult = await txReceiptResponse.json();
      
      if (txReceiptResult.error || !txReceiptResult.result) {
        console.log("Failed to get transaction receipt:", txReceiptResult.error);
        return null;
      }

      const logs = txReceiptResult.result.logs;
      
      // Look for NFT Transfer event (ERC721 transfer) which indicates minting
      // Transfer event signature: Transfer(address,address,uint256)
      const transferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
      
      for (const log of logs) {
        if (log.topics[0] === transferEventSignature && 
            log.topics[1] === "0x0000000000000000000000000000000000000000000000000000000000000000") {
          // This is a mint (from address 0x0), extract token ID from third topic
          const tokenId = BigInt(log.topics[3]).toString();
          console.log("Extracted token ID from logs:", tokenId);
          return tokenId;
        }
      }

      console.log("No token ID found in transaction logs");
      return null;
    } catch (error) {
      console.error("Error extracting token ID:", error);
      return null;
    }
  };

  // Function to check current allowance
  const checkAllowance = async () => {
    try {
      const response = await fetch(
        `https://arb-mainnet.g.alchemy.com/v2/wWCcLJyDISJ25dvLZvCzCK9wKVVI7HPt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: usdcAddress,
                data: `0xdd62ed3e${connectedAddress
                  ?.slice(2)
                  .padStart(64, "0")}${smartAccountAddress
                  .slice(2)
                  .padStart(64, "0")}`,
              },
              "latest",
            ],
            id: 1,
          }),
        }
      );
      const result = await response.json();
      return BigInt(result.result || "0");
    } catch (error) {
      console.error("Failed to check allowance:", error);
      return BigInt(0);
    }
  };

  // Function to get current nonce from EntryPoint
  const getNonceFromEntryPoint = async () => {
    try {
      const response = await fetch(
        `https://arb-mainnet.g.alchemy.com/v2/wWCcLJyDISJ25dvLZvCzCK9wKVVI7HPt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: "0x0000000071727De22E5E9d8BAf0edAc6f37da032", // EntryPoint address
                data: `0x35567e1a${smartAccountAddress.slice(2).padStart(64, '0')}${"0".padStart(64, '0')}`, // getNonce(sender, key)
              },
              "latest",
            ],
            id: 1,
          }),
        }
      );
      const result = await response.json();
      const nonce = BigInt(result.result || "0");
      
      console.log("=== NONCE DEBUG ===");
      console.log("EntryPoint Address:", "0x0000000071727De22E5E9d8BAf0edAc6f37da032");
      console.log("Smart Contract Address:", smartAccountAddress);
      console.log("Current Nonce (hex):", result.result);
      console.log("Current Nonce (decimal):", nonce.toString());
      console.log("Next Nonce (hex):", numberToHex(nonce));
      console.log("==================");
      
      return nonce;
    } catch (error) {
      console.error("Failed to get nonce from EntryPoint:", error);
      return BigInt(0);
    }
  };

  const estimateSwapLp = async () => {
    setEstimateStatus("pending");
    setEstimateError(null);
    setEstimateResult(null);

    const url = import.meta.env.VITE_PIMLICO_URL as string;
    console.log("estimateSwapLp url:", url);

    try {
      // Validate inputs
      if (!connectedAddress || !isConnected) {
        throw new Error("Please connect your wallet first");
      }
      if (!swapAmount || parseFloat(swapAmount) <= 0) {
        throw new Error("Valid swap amount is required");
      }
      if (!slippagePercent || parseFloat(slippagePercent) <= 0) {
        throw new Error("Valid slippage percentage is required");
      }

      // Check current allowance
      const currentAllowance = await checkAllowance();
      const requiredAmount = BigInt(parseFloat(swapAmount) * 1e6);

      console.log("=== ALLOWANCE CHECK ===");
      console.log("Current allowance:", currentAllowance.toString());
      console.log("Required amount:", requiredAmount.toString());
      console.log("Allowance sufficient:", currentAllowance >= requiredAmount);
      console.log("=====================");

      if (currentAllowance < requiredAmount) {
        throw new Error(
          `Insufficient allowance. Current: ${currentAllowance.toString()}, Required: ${requiredAmount.toString()}`
        );
      }

      // Get current nonce from EntryPoint
      const currentNonce = await getNonceFromEntryPoint();

      // First, get gas price
      const gasPriceResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "pimlico_getUserOperationGasPrice",
          params: [],
          id: 1,
        }),
      });

      if (!gasPriceResponse.ok) {
        throw new Error(`Gas price fetch failed: ${gasPriceResponse.status}`);
      }

      const gasPriceData = await gasPriceResponse.json();
      setGasPriceData(gasPriceData);
      const fastGasPrice = gasPriceData.result.fast;

      // Generate call data for uniswapSwapAndMint function
      // USDC has 6 decimals, not 18 like ETH
      const usdcAmount = BigInt(parseFloat(swapAmount) * 1e6);

      console.log("=== ESTIMATE DEBUG INFO ===");
      console.log("Connected Address (user):", connectedAddress);
      console.log("Smart Contract Address:", smartAccountAddress);
      console.log("Swap Amount (input):", swapAmount);
      console.log("USDC Amount (with decimals):", usdcAmount.toString());
      console.log("Slippage Percent:", slippagePercent);
      console.log("========================");

      const callData = encodeUniswapSwapAndMint(
        connectedAddress,
        usdcAmount,
        BigInt(slippagePercent),
        uniswapSwapAndMintAbi
      );

      const userOperation = {
        sender: smartAccountAddress, // Using smart account as sender
        nonce: numberToHex(currentNonce), // Fetched from EntryPoint
        factory: null,
        factoryData: "0x0",
        callData: callData,
        callGasLimit: "0x0",
        verificationGasLimit: "0x0",
        preVerificationGas: "0x0",
        maxPriorityFeePerGas: fastGasPrice.maxPriorityFeePerGas,
        maxFeePerGas: fastGasPrice.maxFeePerGas,
        paymaster: null,
        paymasterVerificationGasLimit: null,
        paymasterPostOpGasLimit: null,
        paymasterData: null,
        signature: "0x0",
      };

      console.log("=== USER OPERATION FOR PIMLICO DEBUGGING ===");
      console.log("EntryPoint:", "0x0000000071727De22E5E9d8BAf0edAc6f37da032");
      console.log("UserOperation JSON:");
      console.log(JSON.stringify(userOperation, null, 2));
      console.log("============================================");

      const requestBody = {
        jsonrpc: "2.0",
        method: "eth_estimateUserOperationGas",
        params: [userOperation, "0x0000000071727De22E5E9d8BAf0edAc6f37da032"],
        id: 1,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setEstimateError(data.error.message);
        setEstimateResult(null);
        setEstimateStatus("failed");
      } else {
        setEstimateResult(data.result);
        setEstimateError(null);
        setEstimateStatus("success");
      }

      return data;
    } catch (error) {
      console.error("Error estimating UserOperation:", error);
      setEstimateError(
        error instanceof Error ? error.message : "Unknown error"
      );
      setEstimateResult(null);
      setEstimateStatus("failed");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div>
        <h2>Uniswap V3 Operations</h2>
        <div className="text-sm text-gray-600 mt-1 space-y-1">
          <div>
            <span className="font-medium">USDC:</span>{" "}
            <a
              href={`https://arbiscan.io/address/${usdcAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {usdcAddress}
            </a>
          </div>
          <div>
            <span className="font-medium">SmartAccount:</span>{" "}
            <a
              href={`https://arbiscan.io/address/${smartAccountAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {smartAccountAddress}
            </a>
          </div>
        </div>
      </div>

      {/* Approve Operation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            1. Approve USDC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>USDC Amount to Approve</Label>
            <Input
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              type="number"
              placeholder="10"
            />
          </div>

          <Button
            onClick={handleApprove}
            className="w-full"
            disabled={approveStatus === "pending" || !isConnected}
          >
            {approveStatus === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve USDC"
            )}
          </Button>

          {approveStatus === "pending" && (
            <Alert>
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription>
                Approving USDC for contract...
              </AlertDescription>
            </Alert>
          )}

          {approveStatus === "success" && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <p className="text-green-800">Approval successful!</p>
                <p className="text-xs mt-1 text-green-700 break-all">
                  Tx: {approveTxHash}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Swap + LP Operation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            2. Swap + LP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Connected Address</Label>
              <div className="p-2 bg-gray-50 rounded text-sm font-mono break-all">
                {isConnected ? connectedAddress : "Not connected"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>USDC Amount to Swap + LP</Label>
              <Input
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                type="number"
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label>Slippage Tolerance (%)</Label>
              <Input
                value={slippagePercent}
                onChange={(e) => setSlippagePercent(e.target.value)}
                type="number"
                placeholder="10"
                min="0"
                max="50"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={estimateSwapLp}
              variant="outline"
              className="flex-1"
              disabled={estimateStatus === "pending" || !isConnected}
            >
              {estimateStatus === "pending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Estimating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Estimate Gas
                </>
              )}
            </Button>

            <Button
              onClick={handleSwapLp}
              className="flex-1"
              size="lg"
              disabled={swapLpStatus === "pending" || !isConnected}
            >
              {swapLpStatus === "pending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                "Execute Swap + LP"
              )}
            </Button>
          </div>

          {estimateStatus === "pending" && (
            <Alert>
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription>
                Estimating gas for swap + LP operation...
              </AlertDescription>
            </Alert>
          )}

          {estimateStatus === "success" && estimateResult && (
            <Alert className="border-blue-500 bg-blue-50">
              <Calculator className="w-4 h-4 text-blue-600" />
              <AlertDescription>
                <p className="text-blue-800 font-medium mb-2">
                  Gas Estimation Results:
                </p>
                <div className="text-xs space-y-1 text-blue-700">
                  <p>
                    <strong>Call Gas Limit:</strong>{" "}
                    {parseInt(estimateResult.callGasLimit, 16).toLocaleString()}
                  </p>
                  <p>
                    <strong>Verification Gas Limit:</strong>{" "}
                    {parseInt(
                      estimateResult.verificationGasLimit,
                      16
                    ).toLocaleString()}
                  </p>
                  <p>
                    <strong>Pre-verification Gas:</strong>{" "}
                    {parseInt(
                      estimateResult.preVerificationGas,
                      16
                    ).toLocaleString()}
                  </p>
                  {gasPriceData?.result?.fast && (
                    <>
                      <p>
                        <strong>Max Priority Fee:</strong>{" "}
                        {parseInt(
                          gasPriceData.result.fast.maxPriorityFeePerGas,
                          16
                        ) / 1e9}{" "}
                        gwei
                      </p>
                      <p>
                        <strong>Max Fee:</strong>{" "}
                        {parseInt(gasPriceData.result.fast.maxFeePerGas, 16) /
                          1e9}{" "}
                        gwei
                      </p>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {estimateStatus === "failed" && estimateError && (
            <Alert className="border-red-500 bg-red-50">
              <AlertDescription>
                <p className="text-red-800">Gas estimation failed:</p>
                <p className="text-xs mt-1 text-red-700">{estimateError}</p>
              </AlertDescription>
            </Alert>
          )}

          {swapLpStatus === "pending" && (
            <Alert>
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription>
                Executing swap and liquidity provision...
              </AlertDescription>
            </Alert>
          )}

          {swapLpStatus === "success" && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription>
                <p className="text-green-800 font-medium">
                  Swap + LP successful!
                </p>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-xs text-green-700">Transaction Hash:</p>
                    <a
                      href={`https://arbiscan.io/tx/${swapLpTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {swapLpTxHash}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">
                      View Position on Uniswap:
                    </p>
                    {tokenId ? (
                      <a
                        href={`https://app.uniswap.org/positions/v3/arbitrum/${tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        🦄 Open in Uniswap (Token ID: {tokenId})
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">
                        🦄 Extracting token ID...
                      </span>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
