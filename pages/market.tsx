import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  IndianRupee,
  BarChart3,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { DataLoading } from '@/components/LoadingSpinner';
import MobileNav from '@/components/MobileNav';

export default function Market() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [orderTypeSelect, setOrderTypeSelect] = useState<string>('limit');

  // Fetch companies
  const { data: companiesResponse, isLoading: companiesLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      companies: any[];
      total: number;
    };
  }>({
    queryKey: ['/api/market/companies'],
  });

  // Fetch market data for selected company
  // const { data: marketDataResponse, isLoading: marketLoading } = useQuery<{
  //   success: boolean;
  //   message: string;
  //   data: any;
  // }>({
  //   queryKey: ['/api/market/company', selectedCompanyId],
  //   enabled: !!selectedCompanyId,
  // });

  // Fetch market trades for selected company

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

  // Fetch wallet balance
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

  // Fetch user orders
  const { data: ordersResponse, isLoading: ordersLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      orders: any[];
      statistics: any;
    };
  }>({
    queryKey: [
      `/api/tokens/orders${user?.id ? `?userId=${user.id}` : ''}${
        selectedCompanyId
          ? `${user?.id ? '&' : '?'}companyId=${selectedCompanyId}`
          : ''
      }`,
    ],
    enabled: !!user?.id,
  });

  const { data: ordersForCompanyResponse, isLoading: ordersForCompanyLoading } =
    useQuery<{
      success: boolean;
      message: string;
      data: {
        orders: any[];
        statistics: any;
      };
    }>({
      queryKey: [
        `/api/tokens/orders${user?.id ? `?userId=${user.id}` : ''}${
          selectedCompanyId
            ? `${user?.id ? '&' : '?'}companyId=${selectedCompanyId}`
            : ''
        }`,
      ],
      enabled: !!user?.id,
    });

  // Place order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      orderType: 'buy' | 'sell';
      quantity: number;
      price: string;
      orderTypeSelect: string;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const endpoint =
        data.orderType === 'buy' ? '/api/tokens/buy' : '/api/tokens/sell';
      return await apiRequest('POST', `${baseUrl}${endpoint}`, {
        companyId: data.companyId,
        quantity: data.quantity,
        pricePerToken: parseFloat(data.price),
        executionType: data.orderTypeSelect,
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
      setQuantity('');
      setPrice('');

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: [
          `/api/tokens/orders${user?.id ? `?userId=${user.id}` : ''}${
            selectedCompanyId
              ? `${user?.id ? '&' : '?'}companyId=${selectedCompanyId}`
              : ''
          }`,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/market/trades', selectedCompanyId],
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/orders'] });
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
    }).format(amount);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(1)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const getPriceChangeClass = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className='h-4 w-4' />
    ) : (
      <TrendingDown className='h-4 w-4' />
    );
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

    createOrderMutation.mutate({
      companyId: selectedCompanyId,
      orderType,
      quantity: quantityNum,
      price: price,
      orderTypeSelect,
    });
  };

  const getAvailableTokens = (companyId: string): number => {
    // Use different data sources based on order type
    const tokens =
      orderType === 'buy'
        ? availableMarketTokensResponse?.data?.orders || []
        : availableTokensResponse?.data?.tokens || [];

    if (!tokens.length) return 0;

    const companyTokens = tokens.filter(
      (token: any) => token.companyId === companyId
    );
    return companyTokens.reduce(
      (total: number, token: any) =>
        total + (token.remainingQuantity || token.quantity || 0),
      0
    );
  };

  const getUserBalance = (): number => {
    return walletResponse?.data?.balance || 0;
  };

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
        (c: any) => c.id === selectedCompanyId
      );
      if (selectedCompany) {
        // For market orders, use the current price divided by 10 (token ratio)
        const marketPrice = parseFloat(selectedCompany.currentPrice) / 10;
        setPrice(marketPrice.toFixed(2));
      }
    }
  }, [orderTypeSelect, selectedCompanyId, companies]);
  const selectedCompany = companies.find(
    (c: any) => c.id === selectedCompanyId
  );

  // Get real orders from API response
  const realOrders = ordersResponse?.data?.orders || [];

  // Filter orders based on status for different tabs
  const openOrders = realOrders.filter(
    (order: any) => order.status === 'pending'
  );

  const orderHistory = realOrders; // All orders for order history

  const tradeHistory = realOrders.filter(
    (order: any) => order.status === 'filled'
  );

  const marketTrades = tradeHistory;

  // Extract order book data from orders response
  const allOrders = ordersResponse?.data?.orders || [];

  // Filter orders for selected company
  const companyOrders = selectedCompanyId
    ? allOrders.filter((order: any) => order.companyId === selectedCompanyId)
    : [];

  // Separate buy and sell orders
  const buyOrders = companyOrders.filter(
    (order: any) => order.orderType === 'buy' && order.status === 'pending'
  );
  const sellOrders = companyOrders.filter(
    (order: any) =>
      order.orderType === 'sell' &&
      (order.status === 'pending' || order.status === 'partially_filled')
  );

  // Sort orders by price (buy orders descending, sell orders ascending)
  buyOrders.sort(
    (a: any, b: any) => parseFloat(b.pricePerUnit) - parseFloat(a.pricePerUnit)
  );
  sellOrders.sort(
    (a: any, b: any) => parseFloat(a.pricePerUnit) - parseFloat(b.pricePerUnit)
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-4 sm:p-6 pb-20 lg:pb-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
              Market
            </h1>
            <p className='text-sm sm:text-base text-gray-600'>
              Trade Tokenized Shares - Real-time Order Book and Market Analysis
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
            {/* Left Column - Market Data */}
            <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
              {/* Select Company */}
              <Card>
                <CardContent className='p-4 sm:p-6'>
                  <Label
                    htmlFor='company'
                    className='text-sm font-medium text-gray-700 mb-2 block'
                  >
                    Select Company
                  </Label>
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
                          const availableQuantity = getAvailableTokens(
                            company.id
                          );
                          return (
                            <SelectItem key={company?.id} value={company?.id}>
                              <div className='flex items-center justify-between w-full'>
                                <div className='flex flex-col'>
                                  <span>
                                    {company?.name} ({company?.symbol})
                                  </span>
                                </div>
                                {/* <span className='text-xs text-green-600 font-medium ml-1'>
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
                </CardContent>
              </Card>

              {/* Market Watch */}
              {selectedCompany && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <BarChart3 className='mr-2 h-5 w-5' />
                      Market Watch - {selectedCompany.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4'>
                      <div>
                        <p className='text-sm text-gray-600'>Last Price</p>
                        <p className='text-base sm:text-lg font-semibold'>
                          ₹
                          {selectedCompany?.currentPrice
                            ? parseFloat(selectedCompany.currentPrice).toFixed(
                                2
                              )
                            : '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h Change</p>
                        <div className='flex items-center space-x-1'>
                          <TrendingUp className='h-4 w-4 text-green-600' />
                          <span className='text-green-600 font-semibold'>
                            +2.5%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h High</p>
                        <p className='text-base sm:text-lg font-semibold'>
                          ₹
                          {selectedCompany?.currentPrice
                            ? (
                                parseFloat(selectedCompany.currentPrice) * 1.05
                              ).toFixed(2)
                            : '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h Low</p>
                        <p className='text-base sm:text-lg font-semibold'>
                          ₹
                          {selectedCompany?.currentPrice
                            ? (
                                parseFloat(selectedCompany.currentPrice) * 0.95
                              ).toFixed(2)
                            : '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h Volume</p>
                        <p className='text-base sm:text-lg font-semibold'>
                          {selectedCompany?.currentPrice
                            ? formatVolume(
                                parseFloat(selectedCompany.currentPrice) * 1000
                              )
                            : '0'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Book */}
              {selectedCompany && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-center'>
                      <BarChart3 className='mr-2 h-5 w-5' />
                      Order Book - {selectedCompany.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-center mb-6'>
                      <div className='text-2xl font-bold text-blue-600'>
                        Current Price: ₹
                        {selectedCompany?.currentPrice
                          ? (
                              parseFloat(selectedCompany.currentPrice) / 10
                            ).toFixed(2)
                          : '0.00'}
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8'>
                      {/* Sell Orders */}
                      <div>
                        <h3 className='text-lg font-semibold text-red-600 mb-4 flex items-center'>
                          <TrendingDown className='mr-2 h-4 w-4' />
                          Sell Orders
                        </h3>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 pb-3 border-b'>
                            <span>Price</span>
                            <span>Tokens</span>
                            <span>Total</span>
                          </div>
                          {sellOrders.length > 0 ? (
                            sellOrders.map((order: any) => (
                              <div
                                key={order.id}
                                className='grid grid-cols-3 gap-4 text-sm py-2 border-b border-gray-100'
                              >
                                <span className='text-red-600 font-medium'>
                                  ₹{parseFloat(order.pricePerUnit).toFixed(2)}
                                </span>
                                <span>{order.remainingQuantity}</span>
                                <span>
                                  ₹
                                  {formatNumber(
                                    parseFloat(order.remainingAmount)
                                  )}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className='text-center py-8 text-gray-500'>
                              <p>No sell orders available</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Buy Orders */}
                      <div>
                        <h3 className='text-lg font-semibold text-green-600 mb-4 flex items-center'>
                          <TrendingUp className='mr-2 h-4 w-4' />
                          Buy Orders
                        </h3>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 pb-3 border-b'>
                            <span>Price</span>
                            <span>Tokens</span>
                            <span>Total</span>
                          </div>
                          {buyOrders.length > 0 ? (
                            buyOrders.map((order: any) => (
                              <div
                                key={order.id}
                                className='grid grid-cols-3 gap-4 text-sm py-2 border-b border-gray-100'
                              >
                                <span className='text-green-600 font-medium'>
                                  ₹{parseFloat(order.pricePerUnit).toFixed(2)}
                                </span>
                                <span>{order.remainingQuantity}</span>
                                <span>
                                  ₹
                                  {formatNumber(
                                    parseFloat(order.remainingAmount)
                                  )}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className='text-center py-8 text-gray-500'>
                              <p>No buy orders available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Management */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <BarChart3 className='mr-2 h-5 w-5' />
                    Order Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue='open-orders' className='w-full'>
                    <TabsList className='grid w-full grid-cols-3'>
                      <TabsTrigger value='open-orders'>Open Orders</TabsTrigger>
                      <TabsTrigger value='order-history'>
                        Order History
                      </TabsTrigger>
                      <TabsTrigger value='trades'>Trades</TabsTrigger>
                    </TabsList>

                    <TabsContent value='open-orders' className='mt-4'>
                      <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {ordersLoading ? (
                          <div className='text-center py-8 text-gray-500'>
                            <DataLoading text='Loading orders...' />
                          </div>
                        ) : openOrders.filter(
                            (order: any) => order.userID === user?.id
                          ).length > 0 ? (
                          openOrders
                            .filter((order: any) => order.userID === user?.id)
                            .map((order: any) => (
                              <div
                                key={order.id}
                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
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
                                    <div className='font-medium text-sm'>
                                      {order.company?.name || 'Unknown'} -{' '}
                                      {order.orderType?.toUpperCase()}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                      {order.remainingQuantity} @ ₹
                                      {order.pricePerUnit}
                                    </div>
                                  </div>
                                </div>
                                <div className='text-right flex items-center space-x-2'>
                                  <Badge
                                    variant='secondary'
                                    className={
                                      order.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : order.status === 'filled'
                                        ? 'bg-green-100 text-green-700'
                                        : order.status === 'partially_filled'
                                        ? 'bg-blue-100 text-blue-700'
                                        : ''
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                  {/* <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    cancelOrderMutation.mutate(order.id)
                                  }
                                  disabled={cancelOrderMutation.isPending}
                                  className='text-red-600 hover:text-red-700'
                                >
                                  Cancel
                                </Button> */}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className='text-center py-8 text-gray-500'>
                            <p>No open orders</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value='trades' className='mt-4'>
                      <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {ordersLoading ? (
                          <div className='text-center py-8 text-gray-500'>
                            <DataLoading text='Loading trades...' />
                          </div>
                        ) : tradeHistory.filter(
                            (order: any) => order.userID === user?.id
                          ).length > 0 ? (
                          tradeHistory
                            .filter((order: any) => order.userID === user?.id)
                            .map((order) => (
                              <div
                                key={order.id}
                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                              >
                                <div className='flex items-center space-x-3'>
                                  <div
                                    className={`p-1 rounded ${
                                      order.orderType === 'buy'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                    }`}
                                  >
                                    {order.orderType === 'buy' ? (
                                      <TrendingUp className='h-3 w-3' />
                                    ) : (
                                      <TrendingDown className='h-3 w-3' />
                                    )}
                                  </div>
                                  <div>
                                    <div className='font-medium text-sm'>
                                      {order.company?.name || 'Unknown'} -{' '}
                                      {order.orderType?.toUpperCase()}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                      {order.filledQuantity} @ ₹
                                      {order.pricePerUnit}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                      {new Date(
                                        order.updatedAt
                                      ).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>
                                <div className='text-right'>
                                  <div className='font-semibold text-sm'>
                                    ₹{formatNumber(order.filledAmount)}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    <Badge
                                      variant='secondary'
                                      className='bg-green-100 text-green-700'
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className='text-center py-8 text-gray-500'>
                            <p>No trades found</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value='order-history' className='mt-4'>
                      <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {ordersLoading ? (
                          <div className='text-center py-8 text-gray-500'>
                            <DataLoading text='Loading order history...' />
                          </div>
                        ) : orderHistory.filter(
                            (order: any) => order.userID === user?.id
                          ).length > 0 ? (
                          orderHistory
                            .filter((order: any) => order.userID === user?.id)
                            .map((order) => (
                              <div
                                key={order.id}
                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
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
                                    <div className='font-medium text-sm'>
                                      {order.company?.name || 'Unknown'} -{' '}
                                      {order.orderType?.toUpperCase()}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                      {order.quantity} @ ₹{order.pricePerUnit}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                      {new Date(
                                        order.createdAt
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <div className='text-right flex items-center space-x-2'>
                                  <div>
                                    <p className='font-medium text-sm'>
                                      ₹{formatNumber(order.totalAmount)}
                                    </p>
                                    <Badge
                                      variant={
                                        order.status === 'filled'
                                          ? 'default'
                                          : order.status === 'partially_filled'
                                          ? 'secondary'
                                          : 'outline'
                                      }
                                      className={
                                        order.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : order.status === 'filled'
                                          ? 'bg-green-100 text-green-700'
                                          : order.status === 'partially_filled'
                                          ? 'bg-blue-100 text-blue-700'
                                          : ''
                                      }
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className='text-center py-8 text-gray-500'>
                            <Clock className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                            <p>No order history</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Trading Tools */}
            <div className='space-y-4 sm:space-y-8'>
              {/* Place Order */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <IndianRupee className='mr-2 h-5 w-5' />
                    Place Order
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 sm:space-y-4'>
                  {/* Buy/Sell Toggle */}
                  <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2'>
                    <Button
                      variant={orderType === 'buy' ? 'default' : 'outline'}
                      onClick={() => setOrderType('buy')}
                      className={`flex-1 text-sm sm:text-base ${
                        orderType === 'buy'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'border-green-600 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <TrendingUp className='w-4 h-4 mr-2' />
                      Buy
                    </Button>
                    <Button
                      variant={orderType === 'sell' ? 'default' : 'outline'}
                      onClick={() => setOrderType('sell')}
                      className={`flex-1 text-sm sm:text-base ${
                        orderType === 'sell'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'border-red-600 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <TrendingDown className='w-4 h-4 mr-2' />
                      Sell
                    </Button>
                  </div>

                  {/* Available Balance/Tokens */}
                  <div className='bg-blue-50 p-3 rounded-lg'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>
                        {orderType === 'sell'
                          ? 'Available Tokens:'
                          : 'Available Balance:'}
                      </span>
                      <span className='text-lg font-semibold text-blue-600'>
                        {orderType === 'sell' ? (
                          selectedCompanyId ? (
                            `${getAvailableTokens(selectedCompanyId)} tokens`
                          ) : (
                            0
                          )
                        ) : walletLoading ? (
                          <span className='text-sm text-gray-500'>
                            Loading...
                          </span>
                        ) : (
                          formatCurrency(getUserBalance())
                        )}
                      </span>
                    </div>
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

                  {/* Quantity */}
                  <div>
                    <Label
                      htmlFor='quantity'
                      className='text-sm font-medium text-gray-700 mb-2 block'
                    >
                      Quantity
                    </Label>
                    <Input
                      id='quantity'
                      type='number'
                      placeholder='Enter quantity'
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min='1'
                    />
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

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePlaceOrder}
                    className='w-full bg-blue-600 hover:bg-blue-700'
                    disabled={
                      !selectedCompanyId ||
                      !quantity ||
                      !price ||
                      createOrderMutation.isPending
                    }
                  >
                    {createOrderMutation.isPending
                      ? 'Placing Order...'
                      : `Place ${orderTypeSelect} ${orderType} Order`}
                  </Button>
                </CardContent>
              </Card>

              {/* Market Trades */}
              {/* {selectedCompany && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center '>
                      <Clock className='mr-2 h-5 w-5' />
                      Market Trades - {selectedCompany.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='justify-between'>
                      <div className='grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 pb-3 border-b'>
                        <span>Price (₹)</span>
                        <span>Amount</span>
                        <span>Time</span>
                      </div>
                      <div className='max-h-64 overflow-y-auto justify-between'>
                        {marketTrades.length > 0 ? (
                          marketTrades.map((trade: any, index: number) => (
                            <div
                              key={index}
                              className='grid grid-cols-3 gap-4 text-sm py-2'
                            >
                              <span className='font-medium text-gray-600'>
                                ₹{parseFloat(trade.price || 0).toFixed(2)}
                              </span>
                              <span>{formatNumber(trade.amount || 0)}</span>
                              <span className='text-gray-500'>
                                {new Date(
                                  trade.timestamp || Date.now()
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className='text-center py-8 text-gray-500'>
                            <p>No market trades available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )} */}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
