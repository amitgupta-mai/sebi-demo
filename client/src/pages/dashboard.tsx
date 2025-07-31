import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
} from 'lucide-react';

interface HoldingsData {
  shares: any[];
  tokens: any[];
}

interface PortfolioSummary {
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
}

export default function Dashboard() {
  const { data: portfolioSummaryResponse, isLoading: summaryLoading } =
    useQuery<{
      success: boolean;
      message: string;
      data: PortfolioSummary;
    }>({
      queryKey: ['/api/portfolio/overview'],
    });

  const { data: holdingsDataResponse, isLoading: holdingsLoading } = useQuery<{
    success: boolean;
    message: string;
    data: HoldingsData;
  }>({
    queryKey: ['/api/portfolio/holdings'],
  });

  const { data: tokenizedSharesResponse, isLoading: tokensLoading } = useQuery<{
    success: boolean;
    message: string;
    data: any[];
  }>({
    queryKey: ['/api/tokens/available'],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<
    any[] | { data: any[] }
  >({
    queryKey: ['/api/transactions'],
  });

  // Extract portfolio summary from API response
  const portfolioSummary = portfolioSummaryResponse?.data;

  // Extract holdings data from API response
  const holdingsData = holdingsDataResponse?.data;

  // Extract tokenized shares from API response
  const tokenizedShares = tokenizedSharesResponse?.data || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Function to safely parse malformed numeric values from API
  const safeParseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value || typeof value !== 'string') return 0;

    // Remove any non-numeric characters except decimal point and minus
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Extract data from holdings with proper error handling
  const shares = holdingsData?.shares || [];
  const tokens = holdingsData?.tokens || [];

  // Debug logging to see what data we're getting
  console.log('holdingsDataResponse:', holdingsDataResponse);
  console.log('holdingsData:', holdingsData);
  console.log('shares:', shares);
  console.log('tokens:', tokens);

  const allHoldings = [
    ...shares.map((holding: any) => ({
      ...holding,
      type: 'share',
      company: {
        name: holding.companyName || holding.company?.name,
        symbol: holding.companySymbol || holding.company?.symbol,
        currentPrice: holding.currentPrice || holding.company?.currentPrice,
      },
      currentValue:
        parseFloat(holding.currentPrice || holding.company?.currentPrice || 0) *
        holding.quantity,
      pnl: 0,
      pnlPercentage: 0,
    })),
    ...tokens.map((token: any) => ({
      ...token,
      type: 'token',
      company: {
        name: token.companyName || token.company?.name,
        symbol: token.companySymbol || token.company?.symbol,
        currentPrice: token.currentPrice || token.company?.currentPrice,
      },
      currentValue:
        parseFloat(token.currentPrice || token.company?.currentPrice || 0) *
        token.quantity,
      pnl: 0,
      pnlPercentage: 0,
    })),
  ];

  const totalHoldings = shares.length + tokens.length;

  // Ensure transactions is always an array and handle API response structure
  const transactionsArray = Array.isArray(transactions)
    ? transactions
    : transactions?.data && Array.isArray(transactions.data)
    ? transactions.data
    : [];
  const recentTransactions = transactionsArray.slice(0, 5);

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <p className='text-gray-600'>
              Welcome back! Here's your portfolio overview.
            </p>
          </div>

          {/* Portfolio Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Portfolio Value
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {summaryLoading
                    ? '...'
                    : formatCurrency(
                        safeParseNumber(portfolioSummary?.totalPortfolioValue)
                      )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {portfolioSummary?.totalProfitLoss ? (
                    <span
                      className={
                        safeParseNumber(portfolioSummary.totalProfitLoss) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {formatPercentage(
                        safeParseNumber(portfolioSummary.totalProfitLoss)
                      )}
                    </span>
                  ) : (
                    'No change'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Holdings
                </CardTitle>
                <Activity className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{totalHoldings}</div>
                <p className='text-xs text-muted-foreground'>
                  {shares.length} shares, {tokens.length} tokens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Invested
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {summaryLoading
                    ? '...'
                    : formatCurrency(
                        Number(portfolioSummary?.totalSharesValue) || 0
                      )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Initial investment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total P&L</CardTitle>
                <TrendingDown className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {summaryLoading
                    ? '...'
                    : formatCurrency(
                        Number(portfolioSummary?.totalProfitLoss) || 0
                      )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {portfolioSummary?.totalProfitLoss ? (
                    <span
                      className={
                        portfolioSummary.totalProfitLoss >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {formatPercentage(portfolioSummary.totalProfitLoss)}
                    </span>
                  ) : (
                    'No change'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className='text-center py-4'>Loading...</div>
                ) : recentTransactions.length > 0 ? (
                  <div className='space-y-4'>
                    {recentTransactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className='flex items-center justify-between'
                      >
                        <div>
                          <p className='font-medium'>
                            {transaction.company?.symbol || 'Unknown'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {transaction.transactionType}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(transaction.totalAmount)}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-4 text-gray-500'>
                    No recent transactions
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {holdingsLoading ? (
                  <div className='text-center py-4'>Loading...</div>
                ) : allHoldings.length > 0 ? (
                  <div className='space-y-4'>
                    {allHoldings.slice(0, 5).map((holding: any) => (
                      <div
                        key={holding.id}
                        className='flex items-center justify-between'
                      >
                        <div>
                          <p className='font-medium'>
                            {holding.company?.symbol || 'Unknown'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {holding.quantity}{' '}
                            {holding.type === 'token' ? 'tokens' : 'shares'}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(holding.currentValue)}
                          </p>
                          <p
                            className={`text-sm ${
                              holding.pnl >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatPercentage(holding.pnlPercentage)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-4 text-gray-500'>
                    No holdings yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
