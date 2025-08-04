import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  WalletIcon,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from 'lucide-react';
import { DataLoading } from '@/components/LoadingSpinner';
import MobileNav from '@/components/MobileNav';

export default function Wallet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addFundAmount, setAddFundAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isAddFundOpen, setIsAddFundOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const { data: walletResponse, isLoading: walletLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      id: string;
      userId: string;
      balance: number;
      totalAdded: number;
      totalWithdrawn: number;

      totalBalance: number;
      createdAt: string;
      updatedAt: string;
    };
  }>({
    queryKey: ['/api/wallet'],
  });

  // Extract wallet data from API response
  const wallet = walletResponse?.data;

  const { data: walletTransactionsResponse, isLoading: transactionsLoading } =
    useQuery<{
      success: boolean;
      message: string;
      data: any[];
    }>({
      queryKey: ['/api/wallet-history'],
    });

  // Extract transactions from API response
  const walletTransactions = walletTransactionsResponse?.data || [];

  const addFundMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethod: string }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return await apiRequest('POST', `${baseUrl}/api/wallet/add-funds`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Funds added successfully!',
      });
      setAddFundAmount('');
      setPaymentMethod('');
      setIsAddFundOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add funds',
        variant: 'destructive',
      });
    },
  });

  const withdrawFundMutation = useMutation({
    mutationFn: async (data: { amount: string }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return await apiRequest(
        'POST',
        `${baseUrl}/api/wallet/withdraw-funds`,
        data
      );
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Withdrawal request submitted successfully!',
      });
      setWithdrawAmount('');
      setIsWithdrawOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process withdrawal',
        variant: 'destructive',
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
      case 'add_funds':
        return <ArrowUpRight className='h-4 w-4 text-green-500' />;
      case 'withdraw_fund':
        return <ArrowDownLeft className='h-4 w-4 text-red-500' />;
      case 'trading_credit':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      case 'trading_debit':
        return <TrendingDown className='h-4 w-4 text-red-500' />;

      default:
        return <DollarSign className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case 'failed':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const getTransactionColor = (type: string) => {
    if (
      type === 'add_funds' ||
      type === 'trading_credit' ||
      type === 'cbdc_deposit'
    ) {
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
        title: 'Error',
        description: 'Please enter amount and select payment method',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(addFundAmount);
    if (amount <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid amount',
        variant: 'destructive',
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
        title: 'Error',
        description: 'Please enter withdrawal amount',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid amount',
        variant: 'destructive',
      });
      return;
    }

    if (wallet && parseFloat(wallet.balance.toString()) < amount) {
      toast({
        title: 'Error',
        description: 'Insufficient balance',
        variant: 'destructive',
      });
      return;
    }

    withdrawFundMutation.mutate({
      amount: withdrawAmount,
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-4 sm:p-6 pb-20 lg:pb-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Wallet</h1>
            <p className='text-gray-600'>
              Manage your funds, add money, and view transaction history
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <WalletIcon className='h-6 w-6 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Current Balance</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {wallet ? formatCurrency(wallet.balance) : '₹0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <TrendingUp className='h-6 w-6 text-green-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Total Added</p>
                    <p className='text-2xl font-bold text-green-600'>
                      {formatCurrency(
                        walletTransactions
                          ?.filter((t: any) => t.historyType === 'add_funds')
                          ?.reduce(
                            (sum: number, t: any) => sum + parseFloat(t.amount),
                            0
                          ) || 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                    <TrendingDown className='h-6 w-6 text-red-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Total Withdrawn</p>
                    <p className='text-2xl font-bold text-red-600'>
                      {formatCurrency(
                        walletTransactions
                          ?.filter(
                            (t: any) => t.historyType === 'withdraw_funds'
                          )
                          ?.reduce(
                            (sum: number, t: any) => sum + parseFloat(t.amount),
                            0
                          ) || 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Dialog open={isAddFundOpen} onOpenChange={setIsAddFundOpen}>
                  <DialogTrigger asChild>
                    <Button className='w-full' size='lg'>
                      <Plus className='mr-2 h-4 w-4' />
                      Add Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Funds to Wallet</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div>
                        <Label htmlFor='amount'>Amount</Label>
                        <Input
                          id='amount'
                          type='number'
                          placeholder='Enter amount'
                          value={addFundAmount}
                          onChange={(e) => setAddFundAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor='payment-method'>Payment Method</Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select payment method' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='upi'>UPI</SelectItem>
                            <SelectItem value='netbanking'>
                              Net Banking
                            </SelectItem>
                            <SelectItem value='card'>
                              Debit/Credit Card
                            </SelectItem>
                            <SelectItem value='wallet'>
                              Digital Wallet
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAddFund}
                        disabled={addFundMutation.isPending}
                        className='w-full'
                      >
                        {addFundMutation.isPending
                          ? 'Processing...'
                          : 'Add Funds'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='w-full' size='lg'>
                      <Minus className='mr-2 h-4 w-4' />
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div>
                        <Label htmlFor='withdraw-amount'>Amount</Label>
                        <Input
                          id='withdraw-amount'
                          type='number'
                          placeholder='Enter amount'
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <p className='text-sm text-gray-500 mt-1'>
                          Available:{' '}
                          {wallet ? formatCurrency(wallet.balance) : '₹0.00'}
                        </p>
                      </div>
                      <Button
                        onClick={handleWithdraw}
                        disabled={withdrawFundMutation.isPending}
                        className='w-full'
                        variant='destructive'
                      >
                        {withdrawFundMutation.isPending
                          ? 'Processing...'
                          : 'Withdraw Funds'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {transactionsLoading ? (
                    <DataLoading text='Loading transactions...' />
                  ) : walletTransactions && walletTransactions.length > 0 ? (
                    <div className='max-h-96 overflow-y-auto'>
                      {walletTransactions?.map((transaction: any) => (
                        <div
                          key={transaction.id}
                          className='flex items-center justify-between p-4 border rounded-lg'
                        >
                          <div className='flex items-center space-x-4'>
                            {getTransactionIcon(transaction.transactionType)}
                            <div>
                              <p className='font-medium'>
                                {transaction?.transactionType
                                  ?.replace('_', ' ')
                                  .toUpperCase()}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleDateString()}{' '}
                                at{' '}
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleTimeString()}
                              </p>
                              {transaction.description && (
                                <p className='text-sm text-gray-600'>
                                  {transaction.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className='flex items-center space-x-3'>
                            <div className='text-right'>
                              <p
                                className={`font-semibold ${getTransactionColor(
                                  transaction.historyType
                                )}`}
                              >
                                {transaction.historyType === 'add_funds' ||
                                transaction.historyType === 'trading_credit'
                                  ? '+'
                                  : '-'}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <div className='flex items-center space-x-1'>
                                {getStatusIcon(transaction.status)}
                                <Badge
                                  variant={
                                    transaction.status === 'completed'
                                      ? 'default'
                                      : transaction.status === 'pending'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-center text-gray-500'>
                      No transactions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
