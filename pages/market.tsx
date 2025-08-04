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
  const { data: marketDataResponse, isLoading: marketLoading } = useQuery<{
    success: boolean;
    message: string;
    data: any;
  }>({
    queryKey: ['/api/market/company', selectedCompanyId],
    enabled: !!selectedCompanyId,
  });

  // Fetch order book for selected company
  const { data: orderBookResponse, isLoading: orderBookLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      buyOrders: any[];
      sellOrders: any[];
      currentPrice: string;
    };
  }>({
    queryKey: ['/api/market/orderbook', selectedCompanyId],
    enabled: !!selectedCompanyId,
  });

  // Fetch market trades for selected company
  const { data: marketTradesResponse, isLoading: tradesLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      trades: any[];
    };
  }>({
    queryKey: ['/api/market/trades', selectedCompanyId],
    enabled: !!selectedCompanyId,
  });

  // Fetch available tokens for user
  const { data: availableTokensResponse, isLoading: tokensLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      tokens: any[];
    };
  }>({
    queryKey: ['/api/tokens/available'],
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
        price: data.price,
        orderType: data.orderTypeSelect,
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
        queryKey: ['/api/market/orderbook', selectedCompanyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/market/trades', selectedCompanyId],
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/available'] });
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
    if (!availableTokensResponse?.data?.tokens) return 0;
    const tokens = availableTokensResponse.data.tokens.filter(
      (token: any) => token.companyId === companyId
    );
    return tokens.reduce(
      (total: number, token: any) =>
        total + (token.remainingQuantity || token.quantity || 0),
      0
    );
  };

  const companies = companiesResponse?.data?.companies || [];
  const selectedCompany = companies.find(
    (c: any) => c.id === selectedCompanyId
  );
  const marketData = marketDataResponse?.data;
  const orderBook = orderBookResponse?.data;
  const marketTrades = marketTradesResponse?.data?.trades || [];

  // Generate mock data for demonstration - exact match to screenshot
  const mockOrderBook = {
    buyOrders: [
      { price: 3444.6, amount: 100, total: 344460.0 },
      { price: 3437.4, amount: 472, total: 1622452.8 },
      { price: 3387.55, amount: 479, total: 1622636.45 },
      { price: 3339.76, amount: 88, total: 293898.88 },
      { price: 3313.81, amount: 364, total: 1206226.84 },
    ],
    sellOrders: [
      { price: 3469.0, amount: 302, total: 1047638.0 },
      { price: 3501.38, amount: 261, total: 913860.18 },
      { price: 3585.8, amount: 358, total: 1283716.4 },
      { price: 3588.77, amount: 191, total: 685455.07 },
      { price: 3616.94, amount: 85, total: 307439.9 },
    ],
    currentPrice: 3456.8,
  };

  const mockMarketTrades = [
    { price: 1667.64, amount: 578, time: '11:25:52 am', isGreen: true },
    { price: 1680.04, amount: 341, time: '11:17:54 am', isGreen: false },
    { price: 1692.7, amount: 553, time: '11:16:57 am', isGreen: true },
    { price: 1674.62, amount: 37, time: '11:16:45 am', isGreen: false },
    { price: 1688.32, amount: 654, time: '11:15:49 am', isGreen: false },
    { price: 1686.76, amount: 432, time: '11:15:48 am', isGreen: false },
    { price: 1681.16, amount: 524, time: '11:15:30 am', isGreen: true },
    { price: 1686.97, amount: 70, time: '11:15:24 am', isGreen: true },
  ];

  // Mock open orders data
  const mockOpenOrders = [
    {
      id: '1',
      company: 'TCS',
      type: 'SELL',
      quantity: 302,
      price: 3469.0,
      status: 'Pending',
    },
    {
      id: '2',
      company: 'TCS',
      type: 'SELL',
      quantity: 261,
      price: 3501.38,
      status: 'Pending',
    },
    {
      id: '3',
      company: 'TCS',
      type: 'BUY',
      quantity: 88,
      price: 3339.76,
      status: 'Pending',
    },
    {
      id: '4',
      company: 'ICICIBANK',
      type: 'SELL',
      quantity: 285,
      price: 966.04,
      status: 'Pending',
    },
    {
      id: '5',
      company: 'ICICIBANK',
      type: 'SELL',
      quantity: 150,
      price: 968.5,
      status: 'Pending',
    },
  ];

  // Mock trade history data
  const mockTradeHistory = [
    {
      id: '1',
      company: 'ICICIBANK',
      type: 'SELL',
      quantity: 209,
      price: 975.1,
      time: '09:52:26 am',
      total: 203795.9,
    },
    {
      id: '2',
      company: 'ICICIBANK',
      type: 'BUY',
      quantity: 120,
      price: 910.27,
      time: '09:52:26 am',
      total: 109232.4,
    },
    {
      id: '3',
      company: 'ICICIBANK',
      type: 'BUY',
      quantity: 175,
      price: 903.25,
      time: '09:52:26 am',
      total: 158068.75,
    },
    {
      id: '4',
      company: 'HDFCBANK',
      type: 'BUY',
      quantity: 48,
      price: 1628.78,
      time: '09:52:26 am',
      total: 78181.44,
    },
    {
      id: '5',
      company: 'TCS',
      type: 'SELL',
      quantity: 95,
      price: 3456.8,
      time: '09:51:15 am',
      total: 328396.0,
    },
    {
      id: '6',
      company: 'RELIANCE',
      type: 'BUY',
      quantity: 75,
      price: 2500.0,
      time: '09:50:30 am',
      total: 187500.0,
    },
  ];

  const mockMarketData = {
    lastPrice: 3456.8,
    change: 1.09,
    high: 3620.54,
    low: 3387.5,
    volume: 1315932.763,
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Market</h1>
            <p className='text-gray-600'>
              Trade Tokenized Shares - Real-time Order Book and Market Analysis
            </p>
          </div>

          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Left Column - Market Data */}
            <div className='xl:col-span-2 space-y-6'>
              {/* Select Company */}
              <Card>
                <CardContent className='p-6'>
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
                      {companiesLoading ? (
                        <SelectItem value='loading' disabled>
                          <DataLoading text='Loading companies...' />
                        </SelectItem>
                      ) : companies.length > 0 ? (
                        companies.map((company: any) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.symbol})
                          </SelectItem>
                        ))
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
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                      <div>
                        <p className='text-sm text-gray-600'>Last Price</p>
                        <p className='text-lg font-semibold'>
                          ₹{mockMarketData.lastPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h Change</p>
                        <div className='flex items-center space-x-1'>
                          <TrendingUp className='h-4 w-4 text-green-600' />
                          <span className='text-green-600 font-semibold'>
                            +{mockMarketData.change}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h High</p>
                        <p className='text-lg font-semibold'>
                          ₹{mockMarketData.high.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h Low</p>
                        <p className='text-lg font-semibold'>
                          ₹{mockMarketData.low.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>24h Volume</p>
                        <p className='text-lg font-semibold'>
                          {formatVolume(mockMarketData.volume)}
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
                        Current Price: ₹{mockOrderBook.currentPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-8'>
                      {/* Sell Orders */}
                      <div>
                        <h3 className='text-lg font-semibold text-red-600 mb-4 flex items-center'>
                          <TrendingDown className='mr-2 h-4 w-4' />
                          Sell Orders
                        </h3>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 pb-3 border-b'>
                            <span>Price</span>
                            <span>Amount</span>
                            <span>Total</span>
                          </div>
                          {mockOrderBook.sellOrders.map((order, index) => (
                            <div
                              key={index}
                              className='grid grid-cols-3 gap-4 text-sm py-2 bg-red-50 rounded'
                            >
                              <span className='text-red-600 font-medium'>
                                ₹{order.price.toFixed(2)}
                              </span>
                              <span>{formatNumber(order.amount)}</span>
                              <span>₹{formatNumber(order.total)}</span>
                            </div>
                          ))}
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
                            <span>Amount</span>
                            <span>Total</span>
                          </div>
                          {mockOrderBook.buyOrders.map((order, index) => (
                            <div
                              key={index}
                              className='grid grid-cols-3 gap-4 text-sm py-2 bg-green-50 rounded'
                            >
                              <span className='text-green-600 font-medium'>
                                ₹{order.price.toFixed(2)}
                              </span>
                              <span>{formatNumber(order.amount)}</span>
                              <span>₹{formatNumber(order.total)}</span>
                            </div>
                          ))}
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
                        {mockOpenOrders.map((order) => (
                          <div
                            key={order.id}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                          >
                            <div className='flex items-center space-x-3'>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  order.type === 'BUY'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                }`}
                              />
                              <div>
                                <div className='font-medium text-sm'>
                                  {order.company} - {order.type}
                                </div>
                                <div className='text-sm text-gray-600'>
                                  {order.quantity} @ ₹{order.price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className='text-right'>
                              <Badge
                                variant='secondary'
                                className='bg-green-100 text-green-700'
                              >
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value='trades' className='mt-4'>
                      <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {mockTradeHistory.map((trade) => (
                          <div
                            key={trade.id}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                          >
                            <div className='flex items-center space-x-3'>
                              <div
                                className={`p-1 rounded ${
                                  trade.type === 'BUY'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                }`}
                              >
                                {trade.type === 'BUY' ? (
                                  <TrendingUp className='h-3 w-3' />
                                ) : (
                                  <TrendingDown className='h-3 w-3' />
                                )}
                              </div>
                              <div>
                                <div className='font-medium text-sm'>
                                  {trade.company} - {trade.type}
                                </div>
                                <div className='text-sm text-gray-600'>
                                  {trade.quantity} @ ₹{trade.price.toFixed(2)}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {trade.time}
                                </div>
                              </div>
                            </div>
                            <div className='text-right'>
                              <div className='font-semibold text-sm'>
                                ₹{formatNumber(trade.total)}
                              </div>
                              <div className='text-xs text-gray-500'>Total</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value='order-history' className='mt-4'>
                      <div className='text-center py-8 text-gray-500'>
                        <Clock className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                        <p>No order history</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Trading Tools */}
            <div className='space-y-8'>
              {/* Place Order */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <IndianRupee className='mr-2 h-5 w-5' />
                    Place Order
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Buy/Sell Toggle */}
                  <div className='flex space-x-2'>
                    <Button
                      variant={orderType === 'buy' ? 'default' : 'outline'}
                      onClick={() => setOrderType('buy')}
                      className='flex-1 bg-green-600 hover:bg-green-700'
                    >
                      Buy
                    </Button>
                    <Button
                      variant={orderType === 'sell' ? 'default' : 'outline'}
                      onClick={() => setOrderType('sell')}
                      className='flex-1 bg-red-600 hover:bg-red-700'
                    >
                      Sell
                    </Button>
                  </div>

                  {/* Available Balance */}
                  <div className='bg-blue-50 p-3 rounded-lg'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>
                        Available Balance:
                      </span>
                      <span className='text-lg font-semibold text-blue-600'>
                        ₹50,00,000
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
                    </Label>
                    <Input
                      id='price'
                      type='number'
                      placeholder='Enter limit price'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min='0.01'
                      step='0.01'
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
              {selectedCompany && (
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
                        {mockMarketTrades.map((trade, index) => (
                          <div
                            key={index}
                            className='grid grid-cols-3 gap-4 text-sm py-2'
                          >
                            <span
                              className={`font-medium ${
                                trade.isGreen
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              ₹{trade.price.toFixed(2)}
                            </span>
                            <span>{formatNumber(trade.amount)}</span>
                            <span className='text-gray-500'>{trade.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
