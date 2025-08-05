import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { DataLoading } from '@/components/LoadingSpinner';
import MobileNav from '@/components/MobileNav';

export default function Trading() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderTypeSelect, setOrderTypeSelect] = useState<string>('limit');

  // Fetch available tokens for user (for selling)
  const { data: availableTokensResponse, isLoading: tokensLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      tokens: any[];
    };
  }>({
    queryKey: ['/api/tokens/available'],
  });

  // Fetch available market tokens for buy orders
  const {
    data: availableMarketTokensResponse,
    isLoading: marketTokensLoading,
  } = useQuery<{
    success: boolean;
    message: string;
    data: {
      orders: any[];
    };
  }>({
    queryKey: ['/api/transactions/available-tokens'],
  });

  const { data: companiesResponse, isLoading: companiesLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      companies: any[];
    };
  }>({
    queryKey: ['/api/market/companies'],
  });

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      orders: any[];
      statistics: any;
    };
  }>({
    queryKey: [`/api/tokens/orders${user?.id ? `?userId=${user?.id}` : ''}`],
    enabled: !!user?.id,
  });

  const { data: portfolioSummaryResponse, isLoading: balanceLoading } =
    useQuery<{
      success: boolean;
      message: string;
      data: {
        totalPortfolioValue: string;
        totalSharesValue: number;
        totalTokensValue: number;
        cashBalance: string;
        totalProfitLoss: number;
        totalSharesProfitLoss: number;
        totalTokensProfitLoss: number;
        totalHoldings: number;
        sharesCount: number;
        tokensCount: number;
      };
    }>({
      queryKey: ['/api/portfolio/overview'],
    });

  // Extract available tokens from API response based on order type
  const availableTokens =
    orderType === 'buy'
      ? availableMarketTokensResponse?.data?.orders || []
      : availableTokensResponse?.data?.tokens || [];
  const allCompanies = companiesResponse?.data?.companies || [];

  // Extract unique companies that have available tokens
  const companies = allCompanies.filter((company) =>
    availableTokens.some((token) => token.companyId === company.id)
  );

  // Auto-set price when market order is selected
  useEffect(() => {
    if (orderTypeSelect === 'market' && selectedCompanyId) {
      const selectedCompany = companies.find(
        (company) => company.id === selectedCompanyId
      );
      if (selectedCompany) {
        // For market orders, use the current price divided by 10 (token ratio)
        const marketPrice = parseFloat(selectedCompany.currentPrice) / 10;
        setPrice(marketPrice.toFixed(2));
      }
    }
  }, [orderTypeSelect, selectedCompanyId, companies]);

  const ordersArray = ordersResponse?.data?.orders || [];

  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      orderType: 'buy' | 'sell';
      quantity: number;
      pricePerToken: number;
      executionType: string;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const endpoint =
        data.orderType === 'buy' ? '/api/tokens/buy' : '/api/tokens/sell';
      return await apiRequest('POST', `${baseUrl}${endpoint}`, {
        companyId: data.companyId,
        quantity: data.quantity,
        pricePerToken: data.pricePerToken,
        executionType: data.executionType,
      });
    },
    onSuccess: (data, variables) => {
      const userName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : 'User';
      const action = orderType === 'buy' ? 'bought' : 'sold';
      toast({
        title: 'Success',
        description: `${userName} ${action} ${quantity} tokens successfully!`,
      });
      setSelectedCompanyId('');
      setQuantity('');
      setPrice('');

      // Invalidate orders query
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/orders'] });

      // Invalidate transactions/available-tokens query if it's a sell order
      if (variables.orderType === 'sell') {
        queryClient.invalidateQueries({
          queryKey: ['/api/transactions/available-tokens'],
        });
      }

      // Invalidate available tokens query to refresh available quantities
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/available'] });

      // Invalidate portfolio overview to refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/overview'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return await apiRequest(
        'DELETE',
        `${baseUrl}/api/tokens/orders/${orderId}`
      );
    },
    onSuccess: (data, orderId) => {
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });

      // Invalidate orders query
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const getUserBalance = (): number => {
    return parseFloat(portfolioSummaryResponse?.data?.cashBalance || '0');
  };

  const getAvailableQuantity = (companyId: string): number => {
    const tokens = availableTokens.filter(
      (t: any) => t.companyId === companyId
    );
    return tokens.reduce(
      (total, token) =>
        total + (token.remainingQuantity || token.quantity || 0),
      0
    );
  };

  const getCompanyLogoClass = (symbol: string) => {
    const symbolLower = symbol.toLowerCase();
    if (symbolLower === 'tcs') return 'company-logo tcs';
    if (symbolLower === 'reliance') return 'company-logo reliance';
    if (symbolLower === 'infy') return 'company-logo infy';
    if (symbolLower === 'hdfcbank') return 'company-logo hdfcbank';
    if (symbolLower === 'icicibank') return 'company-logo icicibank';
    return 'company-logo default';
  };

  const handlePlaceOrder = () => {
    if (!selectedCompanyId || !quantity || !price) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    const priceNum = parseFloat(price);

    if (quantityNum <= 0 || priceNum <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid quantity or price',
        variant: 'destructive',
      });
      return;
    }

    // Check if quantity exceeds available tokens
    const availableQuantity = getAvailableQuantity(selectedCompanyId);
    if (quantityNum > availableQuantity) {
      toast({
        title: 'Insufficient Tokens',
        description: `You requested ${quantityNum} tokens but only ${availableQuantity} are available`,
        variant: 'destructive',
      });
      return;
    }

    // Get selected company and calculate total cost
    const selectedCompany = companies.find(
      (company) => company.id === selectedCompanyId
    );

    if (!selectedCompany) {
      toast({
        title: 'Error',
        description: 'Selected company not found',
        variant: 'destructive',
      });
      return;
    }

    const pricePerToken = parseFloat(selectedCompany.currentPrice);
    const totalCost = (quantityNum * pricePerToken) / 10;
    const userBalance = getUserBalance();

    // Check balance for buy orders
    if (orderType === 'buy' && totalCost > userBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ${formatCurrency(
          totalCost
        )} but your balance is ${formatCurrency(userBalance)}`,
        variant: 'destructive',
      });
      return;
    }

    orderMutation.mutate(
      {
        companyId: selectedCompanyId,
        quantity: quantityNum,
        orderType: orderType,
        pricePerToken: priceNum,
        executionType: orderTypeSelect,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              `/api/tokens/orders${user?.id ? `?userId=${user?.id}` : ''}`,
            ],
          });
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-4 sm:p-6 pb-20 lg:pb-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
              Token Trading
            </h1>
            <p className='text-sm sm:text-base text-gray-600'>
              Trade tokenized shares with real-time pricing and advanced order
              management.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
            {/* Place Order Section - Left Column */}
            <div className='lg:col-span-1'>
              <Card>
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 sm:space-y-4'>
                  <Tabs
                    value={orderType}
                    onValueChange={(value) =>
                      setOrderType(value as 'buy' | 'sell')
                    }
                  >
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger
                        value='buy'
                        className={`${
                          orderType === 'buy'
                            ? 'bg-green-600 text-white data-[state=active]:bg-green-700'
                            : 'text-green-600'
                        }`}
                      >
                        <TrendingUp className='w-4 h-4 mr-2' />
                        Buy
                      </TabsTrigger>
                      <TabsTrigger
                        value='sell'
                        className={`${
                          orderType === 'sell'
                            ? 'bg-red-600 text-white data-[state=active]:bg-red-700'
                            : 'text-red-600'
                        }`}
                      >
                        <TrendingDown className='w-4 h-4 mr-2' />
                        Sell
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {!balanceLoading && (
                    <div className='bg-blue-50 p-3 rounded-lg'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>
                          Available Balance
                        </span>
                        <span className='text-lg font-semibold text-blue-600'>
                          {formatCurrency(getUserBalance())}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor='company'>Select Company</Label>
                    <Select
                      value={selectedCompanyId}
                      onValueChange={setSelectedCompanyId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Choose a company' />
                      </SelectTrigger>
                      <SelectContent>
                        {tokensLoading ||
                        marketTokensLoading ||
                        companiesLoading ? (
                          <SelectItem value='loading' disabled>
                            <DataLoading text='Loading companies...' />
                          </SelectItem>
                        ) : companies && companies.length > 0 ? (
                          companies.map((company: any) => {
                            const availableQuantity = getAvailableQuantity(
                              company.id
                            );
                            return (
                              <SelectItem key={company?.id} value={company?.id}>
                                <div className='flex items-center justify-between w-full'>
                                  <div className='flex flex-col'>
                                    <span>
                                      {company?.name} ({company?.symbol})
                                    </span>
                                    <span className='text-xs text-gray-500'>
                                      {formatCurrency(
                                        parseFloat(company?.currentPrice || 0)
                                      )}
                                    </span>
                                  </div>
                                  {/* <span className='text-xs text-green-600 font-medium'>
                                    {availableQuantity} available
                                  </span> */}
                                </div>
                              </SelectItem>
                            );
                          })
                        ) : (
                          <SelectItem value='no-companies' disabled>
                            No companies available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Order Type */}
                  <div>
                    <Label
                      htmlFor='orderType'
                      className='text-sm font-medium text-gray-700 mb-2 block'
                    >
                      Order Type
                    </Label>
                    <Select
                      value={orderTypeSelect}
                      onValueChange={setOrderTypeSelect}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='limit'>Limit Order</SelectItem>
                        <SelectItem value='market'>Market Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className='text-xs text-gray-500 mt-1'>
                      Execute only at your specified price or better
                    </p>
                  </div>

                  <div>
                    <Label htmlFor='quantity'>Quantity</Label>
                    <Input
                      id='quantity'
                      type='number'
                      placeholder='Enter quantity'
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      max={
                        selectedCompanyId
                          ? getAvailableQuantity(selectedCompanyId)
                          : undefined
                      }
                      min='1'
                      className={
                        selectedCompanyId &&
                        quantity &&
                        (() => {
                          const quantityNum = parseInt(quantity);
                          const availableQuantity =
                            getAvailableQuantity(selectedCompanyId);
                          return (
                            isNaN(quantityNum) ||
                            quantityNum < 1 ||
                            quantityNum > availableQuantity
                          );
                        })()
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    />
                    {selectedCompanyId && (
                      <div className='text-xs mt-1'>
                        <p className='text-gray-500'>
                          Maximum available:{' '}
                          {getAvailableQuantity(selectedCompanyId)} tokens
                        </p>

                        {quantity &&
                          (() => {
                            const quantityNum = parseInt(quantity);
                            const availableQuantity =
                              getAvailableQuantity(selectedCompanyId);

                            if (isNaN(quantityNum) || quantityNum < 1) {
                              return (
                                <div className='text-red-600 mt-1'>
                                  <p className='font-medium'>
                                    ⚠️ Invalid quantity
                                  </p>
                                  <p className='text-xs'>
                                    Please enter a valid number greater than 0
                                  </p>
                                </div>
                              );
                            }

                            if (quantityNum > availableQuantity) {
                              return (
                                <div className='text-red-600 mt-1'>
                                  <p className='font-medium'>
                                    ⚠️ Quantity exceeds available tokens
                                  </p>
                                  <p className='text-xs'>
                                    You requested {quantityNum} but only{' '}
                                    {availableQuantity} are available
                                  </p>
                                </div>
                              );
                            }

                            return null;
                          })()}
                      </div>
                    )}
                  </div>

                  {/* Price per Token */}
                  <div>
                    <Label
                      htmlFor='price'
                      className='text-sm font-medium text-gray-700 mb-2 block'
                    >
                      Price per Token
                      {orderTypeSelect === 'market' && (
                        <span className='text-xs text-gray-500 ml-1'>
                          (Auto-set for market order)
                        </span>
                      )}
                    </Label>
                    <Input
                      id='price'
                      type='number'
                      placeholder={
                        orderTypeSelect === 'market'
                          ? 'Market price (auto-set)'
                          : 'Enter limit price'
                      }
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min='0.01'
                      step='0.01'
                      disabled={orderTypeSelect === 'market'}
                      className={
                        orderTypeSelect === 'market'
                          ? 'bg-gray-100 cursor-not-allowed'
                          : ''
                      }
                    />
                  </div>

                  {/* Cost Preview for Buy Orders */}
                  {orderType === 'buy' &&
                    selectedCompanyId &&
                    quantity &&
                    price &&
                    (() => {
                      const quantityNum = parseInt(quantity);
                      const priceNum = parseFloat(price);
                      const totalCost = quantityNum * priceNum;
                      const userBalance = getUserBalance();
                      const hasInsufficientBalance = totalCost > userBalance;

                      return (
                        <div
                          className={`p-3 rounded-lg ${
                            hasInsufficientBalance
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-green-50 border border-green-200'
                          }`}
                        >
                          <div className='text-sm space-y-1'>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>
                                Price per token:
                              </span>
                              <span className='font-medium'>
                                {formatCurrency(priceNum)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Total cost:</span>
                              <span
                                className={`font-semibold ${
                                  hasInsufficientBalance
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {formatCurrency(totalCost)}
                              </span>
                            </div>
                            {hasInsufficientBalance && (
                              <div className='flex justify-between text-red-600 text-xs'>
                                <span>Insufficient balance</span>
                                <span>
                                  Need {formatCurrency(totalCost - userBalance)}{' '}
                                  more
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  <Button
                    onClick={handlePlaceOrder}
                    className='w-full'
                    variant={orderType === 'buy' ? 'default' : 'destructive'}
                    disabled={
                      !selectedCompanyId ||
                      !quantity ||
                      !price ||
                      orderMutation.isPending ||
                      (() => {
                        const quantityNum = parseInt(quantity);
                        const availableQuantity =
                          getAvailableQuantity(selectedCompanyId);

                        // Check if quantity exceeds available tokens
                        if (quantityNum > availableQuantity) return true;

                        // Check balance for buy orders
                        if (orderType === 'buy') {
                          const priceNum = parseFloat(price);
                          const totalCost = quantityNum * priceNum;
                          const userBalance = getUserBalance();
                          return totalCost > userBalance;
                        }

                        return false;
                      })()
                    }
                  >
                    {orderMutation.isPending
                      ? 'Placing Order...'
                      : `Place ${orderTypeSelect} ${orderType} Order`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
              {/* Market Overview Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {tokensLoading || companiesLoading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                      {[1, 2, 3, 4, 5, 6].map((index) => (
                        <div
                          key={index}
                          className='border border-gray-200 rounded-lg p-4'
                        >
                          <div className='flex items-center space-x-3 mb-2'>
                            <div className='w-8 h-8 bg-gray-200 rounded-full animate-pulse' />
                            <div className='flex-1'>
                              <div className='h-4 bg-gray-200 rounded animate-pulse mb-1' />
                              <div className='h-3 bg-gray-200 rounded animate-pulse' />
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='h-5 bg-gray-200 rounded animate-pulse mb-1' />
                            <div className='h-3 bg-gray-200 rounded animate-pulse' />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                      {companies && companies.length > 0 ? (
                        companies.map((company: any) => (
                          <div
                            key={company.id}
                            className='border border-gray-200 rounded-lg p-4'
                          >
                            <div className='flex items-center space-x-3 mb-2'>
                              <div
                                className={getCompanyLogoClass(company.symbol)}
                              >
                                <span>
                                  {company.symbol.substring(0, 3).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className='font-medium text-gray-900'>
                                  {company.symbol}
                                </h4>
                                <p className='text-xs text-gray-500'>
                                  {company.name}
                                </p>
                              </div>
                            </div>
                            <div className='text-right'>
                              <p className='text-lg font-bold text-gray-900'>
                                {formatCurrency(
                                  parseFloat(company.currentPrice)
                                )}
                              </p>
                              <p className='text-sm text-green-600 flex items-center justify-end'>
                                <TrendingUp className='w-3 h-3 mr-1' />
                                +2.5%
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className='col-span-3 text-center py-8 text-gray-500'>
                          No market data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Your Orders Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className='space-y-4'>
                      {[1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                        >
                          <div className='flex-1'>
                            <div className='h-4 bg-gray-200 rounded animate-pulse mb-2' />
                            <div className='h-3 bg-gray-200 rounded animate-pulse' />
                          </div>
                          <div className='text-right'>
                            <div className='h-4 bg-gray-200 rounded animate-pulse mb-2' />
                            <div className='h-6 bg-gray-200 rounded animate-pulse w-16' />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : ordersArray && ordersArray.length > 0 ? (
                    <div className='space-y-4'>
                      {ordersArray.map((order: any) => (
                        <div
                          key={order?.id}
                          className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                        >
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                order.orderType === 'buy'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <div>
                              <p className='font-medium'>
                                {order?.company?.name || 'Unknown'} -{' '}
                                {order?.orderType?.toUpperCase()}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {order?.quantity} @ ₹{order?.pricePerUnit}
                              </p>
                            </div>
                          </div>
                          <div className='text-right flex items-center space-x-2'>
                            <div>
                              <p className='font-medium'>
                                ₹{formatNumber(order?.totalAmount || 0)}
                              </p>
                              <Badge
                                variant={
                                  order?.status === 'filled'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={
                                  order?.status === 'pending' ||
                                  order?.status === 'partially_filled'
                                    ? 'bg-green-100 text-green-700'
                                    : ''
                                }
                              >
                                {order?.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      <ArrowLeftRight className='mx-auto h-12 w-12 text-gray-300 mb-4' />
                      <p>No orders placed yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
