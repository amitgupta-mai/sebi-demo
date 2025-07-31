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

  const { data: orders = [], isLoading: ordersLoading } = useQuery<
    any | { data: any }
  >({
    queryKey: ['/api/tokens/orders'],
  });

  // Extract companies from API response
  const companies =
    companiesResponse?.data?.companies &&
    companiesResponse?.data?.companies.length > 0
      ? companiesResponse?.data?.companies
      : [
          {
            id: '1',
            name: 'Tata Consultancy Services Ltd',
            symbol: 'TCS',
            currentPrice: '3456.80',
          },
          {
            id: '2',
            name: 'Reliance Industries Ltd',
            symbol: 'RELIANCE',
            currentPrice: '2456.50',
          },
          {
            id: '3',
            name: 'Infosys Ltd',
            symbol: 'INFY',
            currentPrice: '1567.90',
          },
          {
            id: '4',
            name: 'HDFC Bank Ltd',
            symbol: 'HDFCBANK',
            currentPrice: '1678.45',
          },
          {
            id: '5',
            name: 'ICICI Bank Ltd',
            symbol: 'ICICIBANK',
            currentPrice: '987.65',
          },
          {
            id: '6',
            name: 'Wipro Ltd',
            symbol: 'WIPRO',
            currentPrice: '456.78',
          },
        ];

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
      price: number;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const endpoint =
        data.orderType === 'buy' ? '/api/tokens/buy' : '/api/tokens/sell';
      return await apiRequest('POST', `${baseUrl}${endpoint}`, {
        companyId: data.companyId,
        quantity: data.quantity,
        pricePerToken: data.price,
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

    orderMutation.mutate({
      companyId: selectedCompanyId,
      quantity: quantityNum,
      price: priceNum,
      orderType: orderType,
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
                        {companiesLoading ? (
                          <SelectItem value='loading' disabled>
                            Loading...
                          </SelectItem>
                        ) : companies && companies.length > 0 ? (
                          companies.map((company: any) => (
                            <SelectItem key={company?.id} value={company?.id}>
                              {company?.name} ({company?.symbol})
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

                  <div>
                    <Label htmlFor='price'>Price per Token</Label>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      placeholder='Enter price'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
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
                    {companies.slice(0, 6).map((company: any) => {
                      const priceChange = (Math.random() - 0.5) * 10;
                      const changePercent =
                        (priceChange / parseFloat(company?.currentPrice || 1)) *
                        100;

                      return (
                        <div
                          key={company?.id}
                          className='flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow'
                        >
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm bg-blue-100 text-blue-700`}
                            >
                              <span>
                                {company?.symbol
                                  ?.substring(0, 3)
                                  ?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className='font-bold text-lg text-gray-700'>
                                {company?.symbol}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {company?.name}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold text-gray-700'>
                              ₹
                              {parseFloat(company?.currentPrice || 0).toFixed(
                                2
                              )}
                            </p>
                            <div className='flex items-center justify-end text-green-600 mt-1'>
                              <TrendingUp className='h-4 w-4 mr-1' />
                              <span className='text-sm font-medium'>
                                +{formatPercentage(changePercent)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
