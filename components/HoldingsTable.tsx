import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Tag, Coins, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import TokenizeModal from './TokenizeModal';
import ConvertModal from './ConvertModal';

interface HoldingsTableProps {
  holdings: any[];
  tokenizedShares: any[];
  loading: boolean;
}

export default function HoldingsTable({
  holdings,
  tokenizedShares,
  loading,
}: HoldingsTableProps) {
  const [filter, setFilter] = useState<'all' | 'shares' | 'tokens'>('all');
  const [tokenizeModalOpen, setTokenizeModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const handleTokenize = (holding: any) => {
    setSelectedItem(holding);
    setTokenizeModalOpen(true);
  };

  const handleConvert = (tokenizedShare: any) => {
    setSelectedItem(tokenizedShare);
    setConvertModalOpen(true);
  };

  // Combine holdings and tokenized shares for display
  const allItems = [
    ...(holdings || []).map((holding) => ({
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
    ...(tokenizedShares || []).map((token) => ({
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

  const filteredItems = allItems.filter((item) => {
    if (filter === 'shares') return item.type === 'share';
    if (filter === 'tokens') return item.type === 'token';
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center py-8'>Loading holdings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold text-gray-900'>
              My Holdings
            </CardTitle>
            <div className='flex space-x-2'>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'shares' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter('shares')}
              >
                Real Shares
              </Button>
              <Button
                variant={filter === 'tokens' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter('tokens')}
              >
                Tokens
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {filteredItems.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <Briefcase className='mx-auto h-12 w-12 text-gray-300 mb-4' />
              <p>No holdings found</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='holdings-table'>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => (
                    <tr
                      key={`${item.type}-${item.companyId}-${index}`}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td>
                        <div className='flex items-center'>
                          <div
                            className={`${getCompanyLogoClass(
                              item.company?.symbol || 'DEFAULT'
                            )} mr-3`}
                          >
                            <span>
                              {(item.company?.symbol || 'N/A')
                                .substring(0, 3)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {item.company?.name || 'Unknown Company'}
                            </div>
                            <div className='text-sm text-gray-500'>
                              NSE: {item.company?.symbol || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={
                            item.type === 'share' ? 'default' : 'secondary'
                          }
                          className={
                            item.type === 'share'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {item.type === 'share' ? (
                            <>
                              <Tag className='mr-1 h-3 w-3' />
                              Real Share
                            </>
                          ) : (
                            <>
                              <Coins className='mr-1 h-3 w-3' />
                              Token
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className='text-sm text-gray-900'>{item.quantity}</td>
                      <td className='text-sm text-gray-900'>
                        {formatCurrency(
                          parseFloat(item.company?.currentPrice || 0)
                        )}
                      </td>
                      <td className='text-sm text-gray-900'>
                        {formatCurrency(item.currentValue)}
                      </td>

                      <td>
                        <div className='flex space-x-2'>
                          {item.type === 'share' ? (
                            <>
                              <Button
                                variant='link'
                                size='sm'
                                onClick={() => handleTokenize(item)}
                                className='text-primary hover:text-blue-700 p-0 h-auto font-medium'
                              >
                                Tokenize
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant='link'
                                size='sm'
                                onClick={() => handleConvert(item)}
                                className='text-orange-600 hover:text-orange-700 p-0 h-auto font-medium'
                              >
                                Convert
                              </Button>
                              <Button
                                variant='link'
                                size='sm'
                                className='text-red-600 hover:text-red-700 p-0 h-auto font-medium'
                              >
                                Sell
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TokenizeModal
        isOpen={tokenizeModalOpen}
        onClose={() => {
          setTokenizeModalOpen(false);
          setSelectedItem(null);
        }}
        holding={selectedItem}
      />

      <ConvertModal
        isOpen={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setSelectedItem(null);
        }}
        tokenizedShare={selectedItem}
      />
    </>
  );
}
