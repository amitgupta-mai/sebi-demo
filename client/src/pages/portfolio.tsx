import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Tag, Coins, Briefcase } from "lucide-react";

export default function Portfolio() {
  const { data: portfolioSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/portfolio/summary"],
  });

  const { data: holdings = [], isLoading: holdingsLoading } = useQuery({
    queryKey: ["/api/holdings"],
  });

  const { data: tokenizedShares = [], isLoading: tokensLoading } = useQuery({
    queryKey: ["/api/tokenized-shares"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const calculatePnL = (currentPrice: number, averagePrice: number, quantity: number) => {
    const currentValue = currentPrice * quantity;
    const investedValue = averagePrice * quantity;
    const pnl = currentValue - investedValue;
    const pnlPercentage = (pnl / investedValue) * 100;
    return { pnl, pnlPercentage };
  };

  const allHoldings = [
    ...(holdings || []).map((holding: any) => ({
      ...holding,
      type: 'share',
      currentValue: parseFloat(holding.company.currentPrice) * holding.quantity,
      ...calculatePnL(
        parseFloat(holding.company.currentPrice),
        parseFloat(holding.averagePrice),
        holding.quantity
      )
    })),
    ...(tokenizedShares || []).map((token: any) => ({
      ...token,
      type: 'token',
      currentValue: parseFloat(token.company.currentPrice) * token.quantity,
      ...calculatePnL(
        parseFloat(token.company.currentPrice),
        parseFloat(token.tokenizationPrice),
        token.quantity
      )
    }))
  ];

  const totalPnL = allHoldings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalInvested = allHoldings.reduce((sum, holding) => sum + (holding.currentValue - holding.pnl), 0);
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const realSharesPercentage = portfolioSummary?.totalValue > 0 
    ? (portfolioSummary.realSharesValue / portfolioSummary.totalValue) * 100 
    : 0;

  const tokenizedSharesPercentage = portfolioSummary?.totalValue > 0 
    ? (portfolioSummary.tokenizedSharesValue / portfolioSummary.totalValue) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
            <p className="text-gray-600">Comprehensive view of your investments and performance</p>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Portfolio Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summaryLoading ? '...' : formatCurrency(portfolioSummary?.totalValue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total P&L</p>
                    <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                    </p>
                    <p className={`text-sm ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Real Shares</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(portfolioSummary?.realSharesValue || 0)} ({realSharesPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={realSharesPercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Tokenized Shares</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(portfolioSummary?.tokenizedSharesValue || 0)} ({tokenizedSharesPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={tokenizedSharesPercentage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Holdings</span>
                  <span className="font-semibold">{summaryLoading ? '...' : portfolioSummary?.totalHoldings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tokens</span>
                  <span className="font-semibold">{summaryLoading ? '...' : portfolioSummary?.totalTokens || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Orders</span>
                  <span className="font-semibold">{summaryLoading ? '...' : portfolioSummary?.activeOrders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Companies</span>
                  <span className="font-semibold">{allHoldings.length}</span>
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
                <div className="text-center py-8">Loading holdings...</div>
              ) : allHoldings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No holdings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allHoldings.map((holding, index) => (
                    <div key={`${holding.type}-${holding.companyId}-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={getCompanyLogoClass(holding.company.symbol)}>
                            <span>{holding.company.symbol.substring(0, 3).toUpperCase()}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{holding.company.name}</h4>
                            <p className="text-sm text-gray-500">NSE: {holding.company.symbol}</p>
                            <Badge 
                              variant={holding.type === 'share' ? 'default' : 'secondary'}
                              className={`mt-1 ${holding.type === 'share' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
                            >
                              {holding.type === 'share' ? (
                                <>
                                  <Tag className="mr-1 h-3 w-3" />
                                  Real Share
                                </>
                              ) : (
                                <>
                                  <Coins className="mr-1 h-3 w-3" />
                                  Token
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(holding.currentValue)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {holding.quantity} × {formatCurrency(parseFloat(holding.company.currentPrice))}
                          </p>
                          <div className={`text-sm flex items-center justify-end mt-1 ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.pnl >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            <span>
                              {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)} ({holding.pnlPercentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Avg. Price</p>
                          <p className="font-medium">
                            {formatCurrency(parseFloat(holding.type === 'share' ? holding.averagePrice : holding.tokenizationPrice))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current Price</p>
                          <p className="font-medium">
                            {formatCurrency(parseFloat(holding.company.currentPrice))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">{holding.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
