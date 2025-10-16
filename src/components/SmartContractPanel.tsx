import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Wallet,
  ArrowRightLeft,
  Shield,
  Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type TransactionStatus = 'idle' | 'pending' | 'success' | 'failed';

export function SmartContractPanel() {
  const [amount, setAmount] = useState('1.0');
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState('');

  const handleExecute = () => {
    setStatus('pending');
    setTxHash('');

    // Simulate transaction execution
    setTimeout(() => {
      const hash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(hash);
      setStatus('success');
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-auto">
      <div>
        <h2>Smart Contract Operations</h2>
        <p className="text-sm text-muted-foreground">Execute and monitor blockchain transactions</p>
      </div>

      <Tabs defaultValue="swap" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Token Swap
              </CardTitle>
              <CardDescription>Exchange tokens on decentralized protocols</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex gap-2">
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
                  <Button variant="outline" className="w-24">ETH</Button>
                </div>
                <p className="text-sm text-muted-foreground">Balance: 5.234 ETH</p>
              </div>

              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full border-2 bg-background flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>To (estimated)</Label>
                <div className="flex gap-2">
                  <Input value={(parseFloat(amount) * 2850).toFixed(2)} readOnly />
                  <Button variant="outline" className="w-24">USDC</Button>
                </div>
                <p className="text-sm text-muted-foreground">Balance: 12,450.50 USDC</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span>1 ETH = 2,850 USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~$15.50 (22 Gwei)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className="text-green-600">0.12%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum Received</span>
                  <span>{(parseFloat(amount) * 2850 * 0.995).toFixed(2)} USDC</span>
                </div>
              </div>

              <Separator />

              <Button 
                onClick={handleExecute} 
                className="w-full" 
                disabled={status === 'pending'}
              >
                {status === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  'Execute Swap'
                )}
              </Button>

              {status === 'pending' && (
                <Alert>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <AlertDescription>
                    Transaction pending... Please wait for blockchain confirmation.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'success' && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription>
                    <p className="text-green-800">Transaction successful!</p>
                    <p className="text-xs mt-1 text-green-700 break-all">Tx: {txHash}</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm">Contract verified on Etherscan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm">Audited by CertiK</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm">High liquidity pool</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                ETH Staking
              </CardTitle>
              <CardDescription>Stake your ETH to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Amount to Stake</Label>
                <Input type="number" placeholder="0.0" />
                <p className="text-sm text-muted-foreground">Available: 5.234 ETH</p>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">APY</span>
                  <span className="text-sm">4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lock Period</span>
                  <span className="text-sm">None</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Estimated Daily Reward</span>
                  <span className="text-sm">0.000575 ETH</span>
                </div>
              </div>

              <Button className="w-full">Stake ETH</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Staking Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Staked Amount</span>
                  <span>2.5 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rewards Earned</span>
                  <span className="text-green-600">0.0342 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time Staked</span>
                  <span>28 days</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">Claim Rewards</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p>Swap 1.5 ETH → 4,275 USDC</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50">Success</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p>Stake 2.5 ETH</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50">Success</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p>Contract Interaction</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50">Success</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
