import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PortfolioChart from '@/components/PortfolioChart';
import HoldingsTable from '@/components/HoldingsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Tag, Coins, Briefcase } from 'lucide-react';
import { getUniqueCompanies } from '@/lib/utils';
import { DataLoading } from '@/components/LoadingSpinner';
import MobileNav from '@/components/MobileNav';

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
  summary: {
    totalSharesValue: number;
    totalTokensValue: number;
    totalValue: number;
  };
}

export default function Portfolio() {
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

  const getCompanyLogoClass = (symbol: string) => {
    const symbolLower = symbol.toLowerCase();
    if (symbolLower === 'tcs') return 'company-logo tcs';
    if (symbolLower === 'reliance') return 'company-logo reliance';
    if (symbolLower === 'infy') return 'company-logo infy';
    if (symbolLower === 'hdfcbank') return 'company-logo hdfcbank';
    if (symbolLower === 'icicibank') return 'company-logo icicibank';
    return 'company-logo default';
  };

  const calculatePnL = (
    currentPrice: number,
    averagePrice: number,
    quantity: number
  ) => {
    const currentValue = currentPrice * quantity;
    const investedValue = averagePrice * quantity;
    const pnl = currentValue - investedValue;
    const pnlPercentage = (pnl / investedValue) * 100;
    return { pnl, pnlPercentage };
  };

  // Extract shares and tokens from holdings data with proper error handling
  const shares = holdingsData?.shares || [];
  const tokens = holdingsData?.tokens || [];

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
      ...calculatePnL(
        parseFloat(holding.currentPrice || holding.company?.currentPrice || 0),
        parseFloat(holding.averagePrice || 0),
        holding.quantity
      ),
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
      ...calculatePnL(
        parseFloat(token.currentPrice || token.company?.currentPrice || 0),
        parseFloat(token.averagePrice || 0),
        token.quantity
      ),
    })),
  ];

  // Filter out holdings without company data and add debugging
  const validHoldings = allHoldings.filter((holding, index) => {
    return holding.company && holding.company.symbol;
  });

  // Get unique companies from holdings
  const uniqueCompanies = getUniqueCompanies(validHoldings);

  const totalPnL = allHoldings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalInvested = allHoldings.reduce(
    (sum, holding) => sum + (holding.currentValue - holding.pnl),
    0
  );
  const totalPnLPercentage =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Use portfolio summary data if available, otherwise calculate from holdings
  const portfolioData: PortfolioSummary = portfolioSummary
    ? {
        totalPortfolioValue: portfolioSummary.totalPortfolioValue,
        totalSharesValue: safeParseNumber(portfolioSummary.totalSharesValue),
        totalTokensValue: safeParseNumber(portfolioSummary.totalTokensValue),
        cashBalance: portfolioSummary.cashBalance,
        totalProfitLoss: safeParseNumber(portfolioSummary.totalProfitLoss),
        totalSharesProfitLoss: safeParseNumber(
          portfolioSummary.totalSharesProfitLoss
        ),
        totalTokensProfitLoss: safeParseNumber(
          portfolioSummary.totalTokensProfitLoss
        ),
        totalHoldings: portfolioSummary.totalHoldings,
        sharesCount: portfolioSummary.sharesCount,
        tokensCount: portfolioSummary.tokensCount,
      }
    : {
        totalPortfolioValue: allHoldings
          .reduce((sum, holding) => sum + holding.currentValue, 0)
          .toString(),
        totalSharesValue: allHoldings.reduce(
          (sum, holding) => sum + holding.currentValue,
          0
        ),
        totalTokensValue: allHoldings.reduce(
          (sum, holding) => sum + holding.currentValue,
          0
        ),
        cashBalance: '0',
        totalProfitLoss: totalPnL,
        totalSharesProfitLoss: totalPnL,
        totalTokensProfitLoss: totalPnL,
        totalHoldings: allHoldings.length,
        sharesCount: shares.length,
        tokensCount: tokens.length,
      };

  // Ensure totalValue is always a number
  const totalValue = safeParseNumber(portfolioData.totalPortfolioValue);

  const realSharesPercentage =
    totalValue > 0 &&
    portfolioData.totalSharesValue + portfolioData.totalTokensValue > 0
      ? (portfolioData.totalSharesValue /
          (portfolioData.totalSharesValue + portfolioData.totalTokensValue)) *
        100
      : 0;

  const tokenizedSharesPercentage =
    totalValue > 0 &&
    portfolioData.totalSharesValue + portfolioData.totalTokensValue > 0
      ? (portfolioData.totalTokensValue /
          (portfolioData.totalSharesValue + portfolioData.totalTokensValue)) *
        100
      : 0;

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-4 sm:p-6 pb-20 lg:pb-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Portfolio Overview
            </h1>
            <p className='text-gray-600'>
              Comprehensive view of your investments and performance
            </p>
          </div>

          {/* Portfolio Summary */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <p className='text-sm text-gray-500 mb-1'>
                      Total Portfolio Value
                    </p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {summaryLoading ? '...' : formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        Shares
                      </span>
                      <span className='text-sm text-gray-600'>
                        {formatCurrency(
                          Number(portfolioData.totalSharesValue) || 0
                        )}{' '}
                        (
                        {isNaN(realSharesPercentage)
                          ? '0.0'
                          : realSharesPercentage.toFixed(1)}
                        %)
                      </span>
                    </div>
                    <Progress
                      value={
                        isNaN(realSharesPercentage) ? 0 : realSharesPercentage
                      }
                      className='h-2'
                    />
                  </div>
                  <div>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        Tokenized Shares
                      </span>
                      <span className='text-sm text-gray-600'>
                        {formatCurrency(
                          Number(portfolioData.totalTokensValue) || 0
                        )}{' '}
                        (
                        {isNaN(tokenizedSharesPercentage)
                          ? '0.0'
                          : tokenizedSharesPercentage.toFixed(1)}
                        %)
                      </span>
                    </div>
                    <Progress
                      value={
                        isNaN(tokenizedSharesPercentage)
                          ? 0
                          : tokenizedSharesPercentage
                      }
                      className='h-2'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Total Holdings</span>
                  <span className='font-semibold'>
                    {summaryLoading
                      ? '...'
                      : Number(portfolioData.totalHoldings) || 0}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Total Tokens</span>
                  <span className='font-semibold'>
                    {summaryLoading
                      ? '...'
                      : Number(portfolioData.tokensCount) || 0}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Active Orders</span>
                  <span className='font-semibold'>
                    {summaryLoading ? '...' : '0'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Total Companies</span>
                  <span className='font-semibold'>{validHoldings.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Holdings */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdingsLoading || tokensLoading ? (
                <DataLoading text='Loading holdings...' />
              ) : allHoldings.length > 0 ? (
                <div className='space-y-4'>
                  {validHoldings.map((holding, index) => (
                    <div
                      key={`${holding.type}-${holding.companyId}-${index}`}
                      className='border border-gray-200 rounded-lg p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                          <div
                            className={getCompanyLogoClass(
                              holding.company?.symbol || 'DEFAULT'
                            )}
                          >
                            <span>
                              {(holding.company?.symbol || 'N/A')
                                .substring(0, 3)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900'>
                              {holding.company?.name || 'Unknown Company'}
                            </h4>
                            <p className='text-sm text-gray-500'>
                              NSE: {holding.company?.symbol || 'N/A'}
                            </p>
                            <Badge
                              variant={
                                holding.type === 'share'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={`mt-1 ${
                                holding.type === 'share'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {holding.type === 'share' ? (
                                <>
                                  <Tag className='mr-1 h-3 w-3' />
                                  Share
                                </>
                              ) : (
                                <>
                                  <Coins className='mr-1 h-3 w-3' />
                                  Token
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>

                        <div className='text-right'>
                          <p className='text-lg font-bold text-gray-900'>
                            {formatCurrency(holding.currentValue)}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {holding.quantity} ×{' '}
                            {formatCurrency(
                              parseFloat(holding.company?.currentPrice || 0)
                            )}
                          </p>
                          <div
                            className={`text-sm flex items-center justify-end mt-1 ${
                              holding.pnl >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {holding.pnl >= 0 ? (
                              <TrendingUp className='w-3 h-3 mr-1' />
                            ) : (
                              <TrendingDown className='w-3 h-3 mr-1' />
                            )}
                            <span>
                              {holding.pnl >= 0 ? '+' : ''}
                              {formatCurrency(holding.pnl)} (
                              {holding.pnlPercentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='mt-4 grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <p className='text-gray-500'>Avg. Price</p>
                          <p className='font-medium'>
                            {formatCurrency(
                              parseFloat(
                                holding.type === 'share'
                                  ? holding.averagePrice || 0
                                  : holding.averagePrice || 0
                              )
                            )}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Current Price</p>
                          <p className='font-medium'>
                            {formatCurrency(
                              parseFloat(holding.company?.currentPrice || 0)
                            )}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Quantity</p>
                          <p className='font-medium'>{holding.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <Briefcase className='mx-auto h-12 w-12 text-gray-300 mb-4' />
                  <p>No holdings found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
