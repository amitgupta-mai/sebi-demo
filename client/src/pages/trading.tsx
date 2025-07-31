import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowUpDown, Coins } from 'lucide-react';

export default function Trading() {
  const queryClient = useQueryClient();

  const { data: availableTokens = [], isLoading: tokensLoading } = useQuery<
    any | { data: any }
  >({
    queryKey: ['/api/tokens/available'],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<
    any | { data: any }
  >({
    queryKey: ['/api/tokens/orders'],
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
    const symbolLower = symbol?.toLowerCase();
    if (symbolLower === 'tcs') return 'company-logo tcs';
    if (symbolLower === 'reliance') return 'company-logo reliance';
    if (symbolLower === 'infy') return 'company-logo infy';
    if (symbolLower === 'hdfcbank') return 'company-logo hdfcbank';
    if (symbolLower === 'icicibank') return 'company-logo icicibank';
    return 'company-logo default';
  };

  // Handle API response structure properly
  const tokensArray = availableTokens?.data?.tokens;

  console.log(tokensArray, 'tokensArray');

  const ordersArray = Array.isArray(orders)
    ? orders
    : orders?.data && Array.isArray(orders.data)
    ? orders.data
    : [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Token Trading</h1>
            <p className='text-gray-600'>Buy and sell tokenized shares</p>
          </div>

          {/* Available Tokens */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Coins className='mr-2 h-5 w-5' />
                  Available Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokensLoading ? (
                  <div className='text-center py-4'>Loading...</div>
                ) : tokensArray?.length > 0 ? (
                  <div className='space-y-4'>
                    {tokensArray?.map((token: any) => (
                      <div
                        key={token.id}
                        className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={getCompanyLogoClass(
                              token.company?.symbol
                            )}
                          >
                            <span>{token.company?.symbol}</span>
                          </div>
                          <div>
                            <p className='font-medium'>{token.company?.name}</p>
                            <p className='text-sm text-gray-600'>
                              {token.quantity} tokens •{' '}
                              {formatCurrency(token.averagePrice)} avg
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(token.totalValue)}
                          </p>
                          <p
                            className={`text-sm ${
                              token.profitLoss >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatPercentage(token.profitLossPercentage)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <Coins className='mx-auto h-12 w-12 text-gray-300 mb-4' />
                    <p>No tokens available for trading</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trading Orders */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <ArrowUpDown className='mr-2 h-5 w-5' />
                  Trading Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className='text-center py-4'>Loading...</div>
                ) : ordersArray.length > 0 ? (
                  <div className='space-y-4'>
                    {ordersArray.map((order: any) => (
                      <div
                        key={order.id}
                        className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                      >
                        <div>
                          <p className='font-medium'>{order.company?.symbol}</p>
                          <p className='text-sm text-gray-600'>
                            {order.orderType}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <Badge
                            variant={
                              order.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <ArrowUpDown className='mx-auto h-12 w-12 text-gray-300 mb-4' />
                    <p>No trading orders yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Button className='w-full' variant='outline'>
              <TrendingUp className='mr-2 h-4 w-4' />
              Buy Tokens
            </Button>
            <Button className='w-full' variant='outline'>
              <TrendingDown className='mr-2 h-4 w-4' />
              Sell Tokens
            </Button>
            <Button className='w-full' variant='outline'>
              <ArrowUpDown className='mr-2 h-4 w-4' />
              View Orders
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
