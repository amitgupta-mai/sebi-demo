import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
import { Coins, Calculator, AlertCircle } from 'lucide-react';
import { DataLoading } from '@/components/LoadingSpinner';
import MobileNav from '@/components/MobileNav';

export default function Tokenize() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedHolding, setSelectedHolding] = useState<any>(null);

  const { data: holdingsResponse, isLoading: holdingsLoading } = useQuery<{
    success: boolean;
    message: string;
    data: {
      shares: any[];
      tokens: any[];
      summary: {
        totalSharesValue: number;
        totalTokensValue: number;
        totalValue: number;
      };
    };
  }>({
    queryKey: ['/api/portfolio/holdings'],
  });

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

  // Extract data from API responses
  const holdings = holdingsResponse?.data?.shares || [];
  const companies = companiesResponse?.data?.companies || [];

  // Filter companies to only show those where user has shares
  const companiesWithShares = companies.filter((company: any) => {
    const holding = holdings.find((h: any) => h.companyId === company.id);
    return holding && holding.quantity > 0;
  });

  // Get companies without shares for display purposes
  const companiesWithoutShares = companies.filter((company: any) => {
    const holding = holdings.find((h: any) => h.companyId === company.id);
    return !holding || holding.quantity === 0;
  });

  const tokenizeMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      quantity: number;
      price: string;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return await apiRequest('POST', `${baseUrl}/api/shares/tokenize`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Shares tokenized successfully!',
      });
      setSelectedCompanyId('');
      setQuantity('');
      setSelectedHolding(null);
      queryClient.invalidateQueries({
        queryKey: ['/api/portfolio/holdings'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/tokens/available'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/portfolio/overview'],
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to tokenize shares',
        variant: 'destructive',
      });
    },
  });

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = companies?.find((c: any) => c.id === companyId);
    const holding = holdings?.find((h: any) => h.companyId === companyId);

    if (company) {
      setSelectedHolding({
        companyId: company.id,
        company: company,
        quantity: holding?.quantity || 0,
      });
    }
    setQuantity('');
  };

  const handleTokenize = () => {
    if (!selectedHolding || !quantity) {
      toast({
        title: 'Error',
        description: 'Please select a company and enter quantity',
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

    if (
      selectedHolding.quantity > 0 &&
      quantityNum > selectedHolding.quantity
    ) {
      toast({
        title: 'Error',
        description: 'Quantity exceeds available shares',
        variant: 'destructive',
      });
      return;
    }

    tokenizeMutation.mutate({
      companyId: selectedCompanyId,
      quantity: quantityNum,
      price: selectedHolding.company.currentPrice,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTokenizationCost = () => {
    if (!selectedHolding || !quantity) return null;

    const quantityNum = parseInt(quantity);
    const sharePrice = parseFloat(selectedHolding.company.currentPrice);
    const total = sharePrice * quantityNum;

    return { sharePrice, total };
  };

  const costs = calculateTokenizationCost();

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-4 sm:p-6 pb-20 lg:pb-6'>
          <div className='max-w-2xl mx-auto'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Tokenize Shares
              </h1>
              <p className='text-gray-600'>
                Convert your physical shares into digital tokens for enhanced
                liquidity
              </p>
            </div>

            {/* Holdings Summary */}
            {!holdingsLoading && !companiesLoading && (
              <div className='mb-6'>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-600'>
                          Companies with shares
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {companiesWithShares.length}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>Total shares</p>
                        <p className='text-2xl font-bold text-green-600'>
                          {holdings.reduce(
                            (sum, holding) => sum + (holding.quantity || 0),
                            0
                          )}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>
                          Available for tokenization
                        </p>
                        <p className='text-2xl font-bold text-blue-600'>
                          {companiesWithShares.length > 0 ? 'Ready' : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Coins className='mr-2 h-5 w-5' />
                  Share Tokenization
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label htmlFor='company'>Select Company</Label>
                  <Select
                    value={selectedCompanyId}
                    onValueChange={handleCompanySelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Choose a company to tokenize' />
                    </SelectTrigger>
                    <SelectContent>
                      {companiesLoading || holdingsLoading ? (
                        <SelectItem value='loading' disabled>
                          <DataLoading text='Loading companies...' />
                        </SelectItem>
                      ) : companies && companies.length > 0 ? (
                        <>
                          {/* Companies with shares - clickable */}
                          {companiesWithShares.length > 0 && (
                            <>
                              <div className='px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                                Companies with shares
                              </div>
                              {companiesWithShares.map((company: any) => {
                                const holding = holdings.find(
                                  (h: any) => h.companyId === company.id
                                );
                                return (
                                  <SelectItem
                                    key={company.id}
                                    value={company.id}
                                  >
                                    <div className='flex items-center justify-between w-full'>
                                      <span>
                                        {company.name} ({company.symbol})
                                      </span>
                                      <span className='text-xs text-green-600 font-medium'>
                                        {holding?.quantity || 0} shares
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </>
                          )}

                          {/* Companies without shares - disabled */}
                          {companiesWithoutShares.length > 0 && (
                            <>
                              <div className='px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                                Other companies
                              </div>
                              {companiesWithoutShares.map((company: any) => (
                                <SelectItem
                                  key={company.id}
                                  value={company.id}
                                  disabled
                                >
                                  <div className='flex items-center justify-between w-full opacity-50'>
                                    <span>
                                      {company.name} ({company.symbol})
                                    </span>
                                    <span className='text-xs text-gray-400'>
                                      No shares
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </>
                      ) : (
                        <SelectItem value='no-companies' disabled>
                          No companies available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedHolding && (
                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Selected Company Details
                    </h4>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <div className='flex justify-between'>
                        <span>Company:</span>
                        <span>{selectedHolding.company.name}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Available Shares:</span>
                        <span>{selectedHolding.quantity || 0}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Current Price:</span>
                        <span>
                          {formatCurrency(
                            parseFloat(selectedHolding.company.currentPrice)
                          )}
                        </span>
                      </div>
                      {selectedHolding.quantity === 0 && (
                        <div className='flex justify-between text-orange-600'>
                          <span>Note:</span>
                          <span>You don't have shares in this company</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor='quantity'>Number of Shares to Tokenize</Label>
                  <Input
                    id='quantity'
                    type='number'
                    placeholder='Enter quantity'
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    max={selectedHolding?.quantity || 0}
                    min='1'
                    className={
                      selectedHolding &&
                      quantity &&
                      (() => {
                        const quantityNum = parseInt(quantity);
                        return (
                          isNaN(quantityNum) ||
                          quantityNum < 1 ||
                          quantityNum > selectedHolding.quantity
                        );
                      })()
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {selectedHolding && (
                    <div className='text-xs mt-1'>
                      <p className='text-gray-500'>
                        {selectedHolding.quantity > 0
                          ? `Maximum: ${selectedHolding.quantity} shares`
                          : "You don't have shares in this company"}
                      </p>
                      {quantity &&
                        (() => {
                          const quantityNum = parseInt(quantity);

                          if (isNaN(quantityNum) || quantityNum < 1) {
                            return (
                              <p className='text-red-600 font-medium mt-1'>
                                ⚠️ Please enter a valid number greater than 0
                              </p>
                            );
                          }

                          if (quantityNum > selectedHolding.quantity) {
                            return (
                              <p className='text-red-600 font-medium mt-1'>
                                ⚠️ Number of Shares to Tokenize cannot be
                                greater than maximum shares
                              </p>
                            );
                          }

                          return null;
                        })()}
                    </div>
                  )}
                </div>

                {costs && (
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <h4 className='flex items-center text-sm font-medium text-gray-900 mb-2'>
                      <Calculator className='mr-2 h-4 w-4' />
                      Tokenization Summary
                    </h4>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <div className='flex justify-between'>
                        <span>Share Price:</span>
                        <span>{formatCurrency(costs.sharePrice)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Quantity:</span>
                        <span>{quantity} shares</span>
                      </div>

                      <div className='flex justify-between text-gray-600 space-y-1'>
                        <span>Token Quantity:</span>
                        <span>{parseInt(quantity) * 10} tokens</span>
                      </div>
                      <div className='flex justify-between text-gray-600 space-y-1'>
                        <span>Price per token:</span>
                        <span>{formatCurrency(costs.sharePrice / 10)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className='bg-yellow-50 p-4 rounded-lg'>
                  <div className='flex'>
                    <AlertCircle className='h-5 w-5 text-yellow-400 mr-2' />
                    <div className='text-sm'>
                      <h4 className='font-medium text-yellow-800'>
                        Important Information
                      </h4>
                      <ul className='mt-2 text-yellow-700 space-y-1'>
                        <li>
                          • Tokenized shares can be traded 24/7 on our platform
                        </li>
                        <li>
                          • You can convert tokens back to physical shares
                          anytime
                        </li>
                        <li>• Tokenization is irreversible once confirmed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className='flex space-x-3 pt-4'>
                  <Button
                    onClick={handleTokenize}
                    disabled={
                      !selectedHolding ||
                      !quantity ||
                      tokenizeMutation.isPending ||
                      (selectedHolding && selectedHolding.quantity === 0) ||
                      (selectedHolding &&
                        quantity &&
                        parseInt(quantity) > selectedHolding.quantity)
                    }
                    className='flex-1 bg-primary hover:bg-blue-700'
                  >
                    {tokenizeMutation.isPending
                      ? 'Processing...'
                      : selectedHolding && selectedHolding.quantity === 0
                      ? 'No Shares Available'
                      : 'Tokenize Shares'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
