import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
import { TrendingUp, ArrowLeftRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

export default function Trading() {
  const { toast } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  const { data: availableTokensResponse, isLoading: tokensLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      tokens: any[];
    };
  }>({
    queryKey: ['/api/tokens/available'],
  });

  const {
    data: availableMarketTokensResponse,
    isLoading: marketTokensLoading,
  } = useQuery<{
    success: boolean;
    message: string;
    data: {
      transactions: any[];
    };
  }>({
    queryKey: ['/api/transactions/sell'],
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

  const { data: orders = [], isLoading: ordersLoading } = useQuery<
    any | { data: any }
  >({
    queryKey: ['/api/tokens/orders'],
  });

  // Extract available tokens from API response based on selected tab
  const availableTokens =
    orderType === 'buy'
      ? availableMarketTokensResponse?.data?.transactions || []
      : availableTokensResponse?.data?.tokens || [];
  const allCompanies = companiesResponse?.data?.companies || [];

  // Debug logging
  console.log('Current Tab:', orderType);
  console.log(
    'Available Tokens (from',
    orderType === 'buy' ? 'market' : 'available',
    '):',
    availableTokens
  );
  console.log('All Companies:', allCompanies);

  // Extract unique companies that have available tokens
  const companies = allCompanies.filter((company) =>
    availableTokens.some((token) => token.companyId === company.id)
  );

  const ordersArray = Array.isArray(orders)
    ? orders
    : orders?.data && Array.isArray(orders.data)
    ? orders.data
    : [];

  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      orderType: 'buy' | 'sell';
      quantity: number;
      pricePerToken: string;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const endpoint =
        data.orderType === 'buy' ? '/api/tokens/buy' : '/api/tokens/sell';
      return await apiRequest('POST', `${baseUrl}${endpoint}`, {
        companyId: data.companyId,
        quantity: data.quantity,
        pricePerToken: data.pricePerToken,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Order placed successfully!',
      });
      setSelectedCompanyId('');
      setQuantity('');
      setPrice('');
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/orders'] });
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value?.toFixed?.(2)}%`;
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
    if (!selectedCompanyId || !quantity) {
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

    orderMutation.mutate({
      companyId: selectedCompanyId,
      quantity: quantityNum,
      orderType: orderType,
      pricePerToken: companies.find(
        (company) => company.id === selectedCompanyId
      )?.currentPrice,
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Token Trading</h1>
            <p className='text-gray-600'>
              Trade tokenized shares with real-time pricing and advanced order
              management.
            </p>
          </div>

          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Place Order Section - Left Column */}
            <div className='xl:col-span-1'>
              <Card>
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
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
                        {tokensLoading ||
                        marketTokensLoading ||
                        companiesLoading ? (
                          <SelectItem value='loading' disabled>
                            Loading...
                          </SelectItem>
                        ) : companies && companies.length > 0 ? (
                          companies.map((company: any) => (
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
                    className='w-full'
                    variant={orderType === 'buy' ? 'default' : 'destructive'}
                  >
                    Place {orderType.toUpperCase()} Order
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className='xl:col-span-2 space-y-6'>
              {/* Market Overview Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {tokensLoading || companiesLoading ? (
                      <div className='col-span-3 text-center py-4'>
                        Loading market data...
                      </div>
                    ) : companies && companies.length > 0 ? (
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
                              {formatCurrency(parseFloat(company.currentPrice))}
                            </p>
                            <p className='text-sm text-green-600 flex items-center justify-end'>
                              <TrendingUp className='w-3 h-3 mr-1' />
                              +2.5%
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='col-span-3 text-center py-4 text-gray-500'>
                        No market data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Your Orders Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className='text-center py-4'>Loading...</div>
                  ) : ordersArray.length > 0 ? (
                    <div className='space-y-4'>
                      {ordersArray.map((order: any) => (
                        <div
                          key={order?.id}
                          className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                        >
                          <div>
                            <p className='font-medium'>
                              {order?.company?.symbol}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {order?.orderType}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='font-medium'>
                              {formatCurrency(order?.totalAmount || 0)}
                            </p>
                            <Badge
                              variant={
                                order?.status === 'completed'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {order?.status}
                            </Badge>
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
    </div>
  );
}
