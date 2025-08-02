import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PortfolioChart from '@/components/PortfolioChart';
import HoldingsTable from '@/components/HoldingsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Tag,
  Coins,
  Briefcase,
  ExternalLink,
  ChartPie,
  ArrowRightLeft,
} from 'lucide-react';
import { Link } from 'wouter';
import { DataLoading, TableLoading } from '@/components/LoadingSpinner';

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

interface HoldingsData {
  shares: any[];
  tokens: any[];
  summary?: {
    totalSharesValue: number;
    totalTokensValue: number;
    totalValue: number;
  };
}

interface Transaction {
  id: string;
  transactionType: string;
  company: {
    symbol: string;
  };
  quantity: number;
  totalAmount: string;
  createdAt: string;
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

  const { data: transactionsResponse, isLoading: transactionsLoading } =
    useQuery<{
      success: boolean;
      message: string;
      data: Transaction[];
    }>({
      queryKey: ['/api/transactions'],
    });

  // Extract data from API responses
  const portfolioSummary =
    (portfolioSummaryResponse?.data as PortfolioSummary) || {};
  const holdingsData = holdingsDataResponse?.data;
  const transactions = transactionsResponse?.data || [];

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

  // Extract shares and tokens from holdings data
  const shares = holdingsData?.shares || [];
  const tokens = holdingsData?.tokens || [];
  const allHoldings = [...shares, ...tokens];

  const getCompanyLogoClass = (symbol: string) => {
    const symbolLower = symbol.toLowerCase();
    if (symbolLower === 'tcs') return 'company-logo tcs';
    if (symbolLower === 'reliance') return 'company-logo reliance';
    if (symbolLower === 'infy') return 'company-logo infy';
    if (symbolLower === 'hdfcbank') return 'company-logo hdfcbank';
    if (symbolLower === 'icicibank') return 'company-logo icicibank';
    return 'company-logo default';
  };

  const generateKalpScanUrl = (transactionHash: string) => {
    return `${
      import.meta.env.VITE_API_EXPLORER_URL
    }?transactionId=${transactionHash}&network=testnet`;
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          {/* Portfolio Overview Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Portfolio Value
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {summaryLoading
                        ? '...'
                        : formatCurrency(
                            safeParseNumber(
                              portfolioSummary?.totalPortfolioValue
                            )
                          )}
                    </p>
                    <p className='text-sm text-secondary mt-1'>
                      <TrendingUp className='inline w-4 h-4 mr-1' />
                      +8.5% from last month
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <ChartPie className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Real Shares
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {summaryLoading
                        ? '...'
                        : formatCurrency(
                            portfolioSummary?.totalSharesValue || 0
                          )}
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      {summaryLoading
                        ? '...'
                        : `${portfolioSummary?.totalHoldings || 0} holdings`}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <Tag className='h-6 w-6 text-green-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Tokenized Shares
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {summaryLoading
                        ? '...'
                        : formatCurrency(
                            portfolioSummary?.totalTokensValue || 0
                          )}
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      {summaryLoading
                        ? '...'
                        : `${portfolioSummary?.tokensCount || 0} tokens`}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                    <Coins className='h-6 w-6 text-orange-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Active Orders
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {summaryLoading ? '...' : '0'}
                    </p>
                    <p className='text-sm text-destructive mt-1'>
                      Pending execution
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                    <ArrowRightLeft className='h-6 w-6 text-red-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            {/* Portfolio Chart */}
            <div className='lg:col-span-2'>
              <PortfolioChart />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                  Quick Actions
                </h3>
                <div className='space-y-4'>
                  <Button
                    asChild
                    className='w-full bg-primary hover:bg-blue-700'
                  >
                    <Link href='/tokenize'>
                      <Coins className='mr-2 h-4 w-4' />
                      Tokenize Shares
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className='w-full bg-secondary hover:bg-green-700'
                  >
                    <Link href='/trading'>
                      <ArrowRightLeft className='mr-2 h-4 w-4' />
                      Trade Tokens
                    </Link>
                  </Button>

                  <Button asChild className='w-full btn-convert'>
                    <Link href='/convert'>
                      <Tag className='mr-2 h-4 w-4' />
                      Convert to Shares
                    </Link>
                  </Button>

                  <Button asChild variant='outline' className='w-full'>
                    <Link href='/portfolio'>
                      <TrendingUp className='mr-2 h-4 w-4' />
                      View Full Portfolio
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Holdings Table */}
          <HoldingsTable
            holdings={allHoldings}
            tokenizedShares={tokens}
            loading={holdingsLoading}
          />

          {/* Recent Transactions */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                  Recent Transactions
                </h3>
                <div className='space-y-4'>
                  {transactionsLoading ? (
                    <DataLoading text='Loading transactions...' />
                  ) : transactions && transactions.length > 0 ? (
                    transactions.slice(0, 5).map((transaction: Transaction) => (
                      <div
                        key={transaction.id}
                        className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                            <Coins className='h-4 w-4 text-green-600' />
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {transaction.transactionType === 'tokenization'
                                ? 'Tokenized'
                                : transaction.transactionType === 'conversion'
                                ? 'Converted'
                                : transaction.transactionType === 'buy'
                                ? 'Bought'
                                : 'Sold'}{' '}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </p>
                            {(transaction as any).metadata?.transactionHash && (
                              <div className='flex items-center text-xs text-blue-600 mt-1'>
                                <ExternalLink className='h-3 w-3 mr-1' />
                                <a
                                  href={generateKalpScanUrl(
                                    (transaction as any).metadata
                                      .transactionHash
                                  )}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='hover:text-blue-800 hover:underline'
                                >
                                  View on KalpScan
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-medium text-gray-900'>
                            {transaction.transactionType === 'tokenization'
                              ? `${
                                  (transaction as any).metadata
                                    ?.tokenQuantity || transaction.quantity
                                } tokens`
                              : `${transaction.quantity} shares`}
                          </p>
                          <p className='text-xs text-secondary'>
                            {formatCurrency(
                              parseFloat(transaction.totalAmount)
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-4 text-gray-500'>
                      No transactions yet
                    </div>
                  )}

                  <Button asChild variant='outline' className='w-full'>
                    <Link href='/transactions'>View All Transactions</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Market Overview */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                  NSE Market Overview
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className={getCompanyLogoClass('TCS')}>
                        <span>TCS</span>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>TCS</p>
                        <p className='text-xs text-gray-500'>
                          Tata Consultancy
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-gray-900'>
                        ₹3,456.80
                      </p>
                      <p className='text-xs text-secondary'>+2.5%</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className={getCompanyLogoClass('RELIANCE')}>
                        <span>REL</span>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          RELIANCE
                        </p>
                        <p className='text-xs text-gray-500'>
                          Reliance Industries
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-gray-900'>
                        ₹2,845.30
                      </p>
                      <p className='text-xs text-destructive'>-1.2%</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className={getCompanyLogoClass('INFY')}>
                        <span>INF</span>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          INFY
                        </p>
                        <p className='text-xs text-gray-500'>Infosys</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-gray-900'>
                        ₹1,678.90
                      </p>
                      <p className='text-xs text-secondary'>+3.8%</p>
                    </div>
                  </div>

                  <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-gray-600'>
                        NIFTY 50
                      </span>
                      <span className='text-sm font-bold text-gray-900'>
                        21,456.30
                      </span>
                    </div>
                    <div className='flex items-center text-secondary text-sm'>
                      <TrendingUp className='w-4 h-4 mr-1' />
                      <span>+142.50 (+0.67%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
