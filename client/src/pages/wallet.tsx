import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function Wallet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addFundAmount, setAddFundAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [cbdcWalletId, setCbdcWalletId] = useState<string>("");
  const [cbdcAmount, setCbdcAmount] = useState<string>("");
  const [isAddFundOpen, setIsAddFundOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isCbdcConnectOpen, setIsCbdcConnectOpen] = useState(false);
  const [isCbdcTransferOpen, setIsCbdcTransferOpen] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: walletTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/wallet/transactions"],
  });

  const addFundMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethod: string }) => {
      return await apiRequest("POST", "/api/wallet/add-fund", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funds added successfully!",
      });
      setAddFundAmount("");
      setPaymentMethod("");
      setIsAddFundOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds",
        variant: "destructive",
      });
    },
  });

  const withdrawFundMutation = useMutation({
    mutationFn: async (data: { amount: string }) => {
      return await apiRequest("POST", "/api/wallet/withdraw", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully!",
      });
      setWithdrawAmount("");
      setIsWithdrawOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const connectCbdcMutation = useMutation({
    mutationFn: async (data: { cbdcWalletId: string }) => {
      return await apiRequest("POST", "/api/wallet/connect-cbdc", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CBDC wallet connected successfully!",
      });
      setCbdcWalletId("");
      setIsCbdcConnectOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect CBDC wallet",
        variant: "destructive",
      });
    },
  });

  const cbdcTransferMutation = useMutation({
    mutationFn: async (data: { amount: string; transferType: 'deposit' | 'withdraw' }) => {
      return await apiRequest("POST", "/api/wallet/cbdc-transfer", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CBDC transfer completed successfully!",
      });
      setCbdcAmount("");
      setIsCbdcTransferOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process CBDC transfer",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add_fund':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdraw_fund':
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
      case 'trading_credit':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'trading_debit':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'cbdc_deposit':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'cbdc_withdraw':
        return <ArrowDownLeft className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    if (type === 'add_fund' || type === 'trading_credit' || type === 'cbdc_deposit') {
      return 'text-green-600';
    } else if (type === 'cbdc_deposit' || type === 'cbdc_withdraw') {
      return 'text-blue-600';
    } else {
      return 'text-red-600';
    }
  };

  const handleAddFund = () => {
    if (!addFundAmount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(addFundAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Invalid amount",
        variant: "destructive",
      });
      return;
    }

    addFundMutation.mutate({
      amount: addFundAmount,
      paymentMethod,
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) {
      toast({
        title: "Error",
        description: "Please enter withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Invalid amount",
        variant: "destructive",
      });
      return;
    }

    if (wallet && parseFloat((wallet as any).balance) < amount) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    withdrawFundMutation.mutate({
      amount: withdrawAmount,
    });
  };

  const handleConnectCbdc = () => {
    if (!cbdcWalletId) {
      toast({
        title: "Error",
        description: "Please enter CBDC wallet ID",
        variant: "destructive",
      });
      return;
    }

    connectCbdcMutation.mutate({
      cbdcWalletId,
    });
  };

  const handleCbdcTransfer = (transferType: 'deposit' | 'withdraw') => {
    if (!cbdcAmount) {
      toast({
        title: "Error",
        description: "Please enter amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(cbdcAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Invalid amount",
        variant: "destructive",
      });
      return;
    }

    if (transferType === 'withdraw' && wallet && parseFloat((wallet as any).cbdcBalance || '0') < amount) {
      toast({
        title: "Error",
        description: "Insufficient CBDC balance",
        variant: "destructive",
      });
      return;
    }

    cbdcTransferMutation.mutate({
      amount: cbdcAmount,
      transferType,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
            <p className="text-gray-600">Manage your funds, add money, and view transaction history</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <WalletIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {wallet ? formatCurrency((wallet as any).balance) : "₹0.00"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Added</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        (walletTransactions as any[])
                          .filter((t: any) => t.transactionType === 'add_fund' && t.status === 'completed')
                          .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Withdrawn</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(
                        (walletTransactions as any[])
                          .filter((t: any) => t.transactionType === 'withdraw_fund' && t.status === 'completed')
                          .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CBDC Balance</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {wallet ? formatCurrency((wallet as any).cbdcBalance || 0) : "₹0.00"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {wallet && (wallet as any).cbdcWalletConnected ? "Connected" : "Not Connected"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isAddFundOpen} onOpenChange={setIsAddFundOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Funds to Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={addFundAmount}
                          onChange={(e) => setAddFundAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="netbanking">Net Banking</SelectItem>
                            <SelectItem value="debit_card">Debit Card</SelectItem>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleAddFund}
                        disabled={addFundMutation.isPending}
                        className="w-full"
                      >
                        {addFundMutation.isPending ? "Processing..." : "Add Funds"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" size="lg">
                      <Minus className="mr-2 h-4 w-4" />
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="withdraw-amount">Amount</Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Available: {wallet ? formatCurrency((wallet as any).balance) : "₹0.00"}
                        </p>
                      </div>
                      <Button 
                        onClick={handleWithdraw}
                        disabled={withdrawFundMutation.isPending}
                        className="w-full"
                        variant="destructive"
                      >
                        {withdrawFundMutation.isPending ? "Processing..." : "Withdraw Funds"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isCbdcConnectOpen} onOpenChange={setIsCbdcConnectOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant={wallet && (wallet as any).cbdcWalletConnected ? "secondary" : "default"}
                      size="lg" 
                      className="w-full"
                      disabled={wallet && (wallet as any).cbdcWalletConnected}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {wallet && (wallet as any).cbdcWalletConnected ? "CBDC Connected" : "Connect CBDC"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect CBDC Wallet</DialogTitle>
                      <p className="text-sm text-gray-600">Link your Central Bank Digital Currency wallet to enable digital currency transactions</p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cbdc-wallet-id">CBDC Wallet ID</Label>
                        <Input
                          id="cbdc-wallet-id"
                          type="text"
                          placeholder="Enter your CBDC wallet ID"
                          value={cbdcWalletId}
                          onChange={(e) => setCbdcWalletId(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: CBDC-XXXX-XXXX-XXXX</p>
                      </div>
                      <Button 
                        onClick={handleConnectCbdc}
                        disabled={connectCbdcMutation.isPending}
                        className="w-full"
                      >
                        {connectCbdcMutation.isPending ? "Connecting..." : "Connect CBDC Wallet"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isCbdcTransferOpen} onOpenChange={setIsCbdcTransferOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      disabled={!wallet || !(wallet as any).cbdcWalletConnected}
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      CBDC Transfer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>CBDC Transfer</DialogTitle>
                      <p className="text-sm text-gray-600">Transfer funds between your CBDC wallet and regular wallet</p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cbdc-amount">Amount</Label>
                        <Input
                          id="cbdc-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={cbdcAmount}
                          onChange={(e) => setCbdcAmount(e.target.value)}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Wallet Balance: {wallet ? formatCurrency((wallet as any).balance) : "₹0.00"}</span>
                          <span>CBDC Balance: {wallet ? formatCurrency((wallet as any).cbdcBalance || 0) : "₹0.00"}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          onClick={() => handleCbdcTransfer('deposit')}
                          disabled={cbdcTransferMutation.isPending}
                          className="w-full"
                        >
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          {cbdcTransferMutation.isPending ? "Processing..." : "Deposit to CBDC"}
                        </Button>
                        <Button 
                          onClick={() => handleCbdcTransfer('withdraw')}
                          disabled={cbdcTransferMutation.isPending}
                          variant="outline"
                          className="w-full"
                        >
                          <ArrowDownLeft className="mr-2 h-4 w-4" />
                          {cbdcTransferMutation.isPending ? "Processing..." : "Withdraw from CBDC"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionsLoading ? (
                    <p className="text-center text-gray-500">Loading transactions...</p>
                  ) : (walletTransactions as any[]).length === 0 ? (
                    <p className="text-center text-gray-500">No transactions yet</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {(walletTransactions as any[]).map((transaction: any) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            {getTransactionIcon(transaction.transactionType)}
                            <div>
                              <p className="font-medium">
                                {transaction.transactionType.replace('_', ' ').toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.createdAt).toLocaleDateString()} at {' '}
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-gray-600">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className={`font-semibold ${getTransactionColor(transaction.transactionType)}`}>
                                {transaction.transactionType === 'add_fund' || transaction.transactionType === 'trading_credit' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(transaction.status)}
                                <Badge variant={transaction.status === 'completed' ? 'default' : transaction.status === 'pending' ? 'secondary' : 'destructive'}>
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}