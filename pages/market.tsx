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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  IndianRupee,
  BarChart3,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DataLoading } from '@/components/LoadingSpinner';

export default function Market() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [chartTimeframe, setChartTimeframe] = useState<string>('1D');

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

  const { data: marketDataResponse, isLoading: marketLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      marketStats: {
        totalCompanies: number;
        totalMarketCap: string;
        totalVolume: string;
        gainers: number;
        losers: number;
      };
      companies: any[];
    };
  }>({
    queryKey: ['/api/market/overview'],
  });

  // Extract market data from API response
  const marketData = marketDataResponse?.data;
  const marketStats = marketData?.marketStats;
  const allCompanies = marketData?.companies || [];

  const { data: tokenizedSharesResponse, isLoading: tokensLoading } = useQuery<{
    success: boolean;
    message: string;
    data: any;
  }>({
    queryKey: ['/api/tokens/available'],
  });

  // Extract companies from the API response
  const companies = companiesResponse?.data?.companies || [];

  // Extract tokenized shares from API response
  const tokenizedShares = tokenizedSharesResponse?.data?.tokens || [];

  // Extract unique companies from available tokens for trading
  const availableCompanies = tokenizedShares.reduce(
    (unique: any[], token: any) => {
      const company = token.company;
      if (company && !unique.find((c) => c.id === company.id)) {
        unique.push({
          id: company.id || token.companyId,
          name: company.name,
          symbol: company.symbol,
          currentPrice: token.currentPrice,
        });
      }
      return unique;
    },
    []
  );

  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      tokenId: string;
      orderType: 'buy' | 'sell';
      quantity: number;
      price: string;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const endpoint =
        data.orderType === 'buy' ? '/api/tokens/buy' : '/api/tokens/sell';
      return await apiRequest('POST', `${baseUrl}${endpoint}`, {
        tokenId: data.tokenId,
        companyId: data.companyId,
        quantity: data.quantity,
      });
    },
    onSuccess: (data, variables) => {
      const userName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : 'User';
      const action = orderType === 'buy' ? 'bought' : 'sold';
      toast({
        title: 'Success',
        description: `${action} ${quantity} tokens for user ${userName}`,
      });
      setSelectedCompanyId('');
      setQuantity('');

      // Invalidate orders query
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/orders'] });

      // Invalidate available tokens query
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/available'] });

      // Invalidate transactions/available-tokens query if it's a sell order
      if (variables.orderType === 'sell') {
        queryClient.invalidateQueries({ queryKey: ['/api/transactions/available-tokens'] });
      }

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(1)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const formatLargeNumber = (value: string | number | undefined) => {
    if (!value) return '0';

    // Check if the value contains scientific notation
    const valueStr = String(value);
    if (valueStr.includes('e') || valueStr.includes('E')) {
      return '0';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    // Check for invalid or extremely large numbers
    if (isNaN(num) || !isFinite(num) || num < 0) return '0';

    // Handle extremely large numbers that might cause overflow
    if (num > 1e15) return '0';

    // Handle different scales
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;

    return num.toFixed(1);
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

  const generateCandlestickData = (basePrice: number) => {
    const data = [];
    let currentPrice = basePrice;

    for (let i = 0; i < 30; i++) {
      const variation = (Math.random() - 0.5) * 0.1;
      const open = currentPrice;
      const close = open * (1 + variation);
      const high = Math.max(open, close) * (1 + Math.random() * 0.05);
      const low = Math.min(open, close) * (1 - Math.random() * 0.05);

      data.push({
        date: new Date(
          Date.now() - (29 - i) * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });

      currentPrice = close;
    }

    return data;
  };

  const handlePlaceOrder = () => {
    if (!selectedCompanyId || !quantity) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    const quantityNum = parseInt(quantity);

    if (quantityNum <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid quantity',
        variant: 'destructive',
      });
      return;
    }

    // For sell orders, check if user has enough tokens
    let tokenizedShare: any = null;
    if (orderType === 'sell') {
      tokenizedShare = tokenizedShares?.find(
        (ts: any) => ts.companyId === selectedCompanyId
      );
      if (!tokenizedShare || tokenizedShare.quantity < quantityNum) {
        toast({
          title: 'Error',
          description: 'Insufficient tokens to sell',
          variant: 'destructive',
        });
        return;
      }
    }

    createOrderMutation.mutate({
      companyId: selectedCompanyId,
      tokenId: tokenizedShare?.id || '',
      orderType,
      quantity: quantityNum,
      price:
        availableCompanies.find(
          (company: any) => company.id === selectedCompanyId
        )?.currentPrice || '0',
    });
  };

  const selectedCompany = allCompanies?.find(
    (c: any) => c.id === selectedCompanyId
  );
  const candlestickData = selectedCompany
    ? generateCandlestickData(parseFloat(selectedCompany.currentPrice))
    : [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Market</h1>
            <p className='text-gray-600'>
              Real-time market data, trading charts, and token exchange
            </p>
          </div>

          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Market Overview */}
            <div className='xl:col-span-2 space-y-6'>
              {/* Market Stats */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {marketLoading ? (
                  <>
                    {[1, 2, 3].map((index) => (
                      <Card key={index}>
                        <CardContent className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <div className='h-5 w-5 bg-gray-200 rounded animate-pulse' />
                            <div className='flex-1'>
                              <div className='h-4 bg-gray-200 rounded animate-pulse mb-2' />
                              <div className='h-6 bg-gray-200 rounded animate-pulse' />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <>
                    <Card>
                      <CardContent className='p-4'>
                        <div className='flex items-center space-x-2'>
                          <Activity className='h-5 w-5 text-blue-500' />
                          <div>
                            <p className='text-sm text-gray-600'>Market Cap</p>
                            <p className='text-lg font-semibold'>
                              ₹{formatLargeNumber(marketStats?.totalMarketCap)}T
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className='p-4'>
                        <div className='flex items-center space-x-2'>
                          <TrendingUp className='h-5 w-5 text-green-500' />
                          <div>
                            <p className='text-sm text-gray-600'>Gainers</p>
                            <p className='text-lg font-semibold text-green-600'>
                              {marketStats?.gainers || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className='p-4'>
                        <div className='flex items-center space-x-2'>
                          <TrendingDown className='h-5 w-5 text-red-500' />
                          <div>
                            <p className='text-sm text-gray-600'>Losers</p>
                            <p className='text-lg font-semibold text-red-600'>
                              {marketStats?.losers || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Market Table */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <BarChart3 className='mr-2 h-5 w-5' />
                    Market Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {marketLoading ? (
                    <div className='flex items-center justify-center py-12'>
                      <DataLoading text='Loading market data...' />
                    </div>
                  ) : (
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead>
                          <tr className='border-b'>
                            <th className='text-left py-3 px-4 font-medium text-gray-600'>
                              Company
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-gray-600'>
                              Price
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-gray-600'>
                              Change
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-gray-600'>
                              Volume
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-gray-600'>
                              Market Cap
                            </th>
                            <th className='text-center py-3 px-4 font-medium text-gray-600'>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allCompanies.length > 0 ? (
                            allCompanies.map((company: any) => {
                              const currentPrice = parseFloat(
                                company.currentPrice
                              );
                              const previousClose = parseFloat(
                                company.previousClose
                              );
                              const priceChange = company.priceChange;
                              const changePercent = parseFloat(
                                company.changePercentage
                              );
                              const volume = parseInt(company.volume);
                              const marketCap = parseFloat(company.marketCap);

                              return (
                                <tr
                                  key={company.id}
                                  className='border-b hover:bg-gray-50'
                                >
                                  <td className='py-3 px-4'>
                                    <div>
                                      <div className='font-medium'>
                                        {company.name}
                                      </div>
                                      <div className='text-sm text-gray-600'>
                                        {company.symbol}
                                      </div>
                                    </div>
                                  </td>
                                  <td className='text-right py-3 px-4 font-medium'>
                                    {formatCurrency(currentPrice)}
                                  </td>
                                  <td
                                    className={`text-right py-3 px-4 ${getPriceChangeClass(
                                      priceChange
                                    )}`}
                                  >
                                    <div className='flex items-center justify-end space-x-1'>
                                      {getPriceChangeIcon(priceChange)}
                                      <span>
                                        {changePercent >= 0 ? '+' : ''}
                                        {changePercent.toFixed(2)}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className='text-right py-3 px-4 text-gray-600'>
                                    {formatVolume(volume)}
                                  </td>
                                  <td className='text-right py-3 px-4 text-gray-600'>
                                    ₹{formatLargeNumber(marketCap)}Cr
                                  </td>
                                  <td className='text-center py-3 px-4'>
                                    <Button
                                      size='sm'
                                      onClick={() =>
                                        setSelectedCompanyId(company.id)
                                      }
                                      variant='outline'
                                    >
                                      Trade
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className='text-center py-8 text-gray-500'
                              >
                                No market data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chart Section */}
              {selectedCompany && (
                <Card>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='flex items-center'>
                        <BarChart3 className='mr-2 h-5 w-5' />
                        {selectedCompany.name} ({selectedCompany.symbol})
                      </CardTitle>
                      <div className='flex space-x-2'>
                        {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
                          <Button
                            key={timeframe}
                            size='sm'
                            variant={
                              chartTimeframe === timeframe
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => setChartTimeframe(timeframe)}
                          >
                            {timeframe}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='mb-4'>
                      <div className='text-2xl font-bold'>
                        {formatCurrency(
                          parseFloat(selectedCompany.currentPrice)
                        )}
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${
                          selectedCompany.isGaining
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {selectedCompany.isGaining ? (
                          <TrendingUp className='h-4 w-4' />
                        ) : (
                          <TrendingDown className='h-4 w-4' />
                        )}
                        <span>
                          {selectedCompany.changePercentage >= 0 ? '+' : ''}
                          {selectedCompany.changePercentage}% (+₹
                          {selectedCompany.priceChange})
                        </span>
                      </div>
                    </div>

                    {/* Simple Candlestick Representation */}
                    <div className='h-64 bg-gray-100 rounded-lg p-4 flex items-end space-x-1'>
                      {candlestickData.slice(-20).map((candle, index) => {
                        const height = Math.random() * 150 + 50;
                        const isGreen =
                          parseFloat(candle.close) >= parseFloat(candle.open);

                        return (
                          <div
                            key={index}
                            className='flex-1 flex flex-col items-center'
                          >
                            <div
                              className={`w-full ${
                                isGreen ? 'bg-green-500' : 'bg-red-500'
                              } rounded-sm`}
                              style={{ height: `${height}px` }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className='mt-4 grid grid-cols-4 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-600'>Open: </span>
                        <span className='font-medium'>
                          ₹{candlestickData[candlestickData.length - 1]?.open}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>High: </span>
                        <span className='font-medium'>
                          ₹{candlestickData[candlestickData.length - 1]?.high}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Low: </span>
                        <span className='font-medium'>
                          ₹{candlestickData[candlestickData.length - 1]?.low}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Close: </span>
                        <span className='font-medium'>
                          ₹{candlestickData[candlestickData.length - 1]?.close}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Trading Panel */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <IndianRupee className='mr-2 h-5 w-5' />
                    Place Order
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Tabs
                    value={orderType}
                    onValueChange={(value) =>
                      setOrderType(value as 'buy' | 'sell')
                    }
                  >
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger value='buy' className='text-green-600'>
                        Buy
                      </TabsTrigger>
                      <TabsTrigger value='sell' className='text-red-600'>
                        Sell
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

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
                        {tokensLoading || companiesLoading ? (
                          <SelectItem value='loading' disabled>
                            <DataLoading text='Loading companies...' />
                          </SelectItem>
                        ) : availableCompanies &&
                          availableCompanies.length > 0 ? (
                          availableCompanies.map((company: any) => (
                            <SelectItem key={company?.id} value={company?.id}>
                              {company?.name} ({company?.symbol}) -{' '}
                              {formatCurrency(
                                parseFloat(company?.currentPrice)
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value='no-companies' disabled>
                            No companies available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='quantity'>Quantity</Label>
                    <Input
                      id='quantity'
                      type='number'
                      placeholder='Enter quantity'
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={createOrderMutation.isPending}
                    className='w-full'
                    variant={orderType === 'buy' ? 'default' : 'destructive'}
                  >
                    {createOrderMutation.isPending
                      ? 'Placing Order...'
                      : `Place ${orderType.toUpperCase()} Order`}
                  </Button>
                </CardContent>
              </Card>

              {/* Market News */}
              <Card>
                <CardHeader>
                  <CardTitle>Market News</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='p-3 border-l-4 border-green-500 bg-green-50'>
                    <div className='font-medium text-sm'>
                      TCS Reports Strong Q4 Results
                    </div>
                    <div className='text-xs text-gray-600 mt-1'>
                      Revenue up 12% YoY, margin expansion continues
                    </div>
                  </div>
                  <div className='p-3 border-l-4 border-blue-500 bg-blue-50'>
                    <div className='font-medium text-sm'>
                      Reliance Expands Digital Portfolio
                    </div>
                    <div className='text-xs text-gray-600 mt-1'>
                      New partnerships in fintech and e-commerce
                    </div>
                  </div>
                  <div className='p-3 border-l-4 border-purple-500 bg-purple-50'>
                    <div className='font-medium text-sm'>
                      Infosys Wins Major Contract
                    </div>
                    <div className='text-xs text-gray-600 mt-1'>
                      $1.5B deal with European bank announced
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
