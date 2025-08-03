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
import { Undo2, Calculator, AlertCircle } from 'lucide-react';
import { DataLoading } from '@/components/LoadingSpinner';

export default function Convert() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedTokenizedShare, setSelectedTokenizedShare] =
    useState<any>(null);

  const { data: tokenizedSharesResponse, isLoading: tokensLoading } = useQuery<{
    success: boolean;
    message: string;
    data: any;
  }>({
    queryKey: ['/api/tokens/available-for-conversion'],
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

  // Extract tokenized shares from API response
  const tokenizedShares = tokenizedSharesResponse?.data || [];

  // Extract companies from API response
  const companies = companiesResponse?.data?.companies || [];

  const convertMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      quantity: number;
      price: string;
      tokenId: string;
    }) => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return await apiRequest(
        'POST',
        `${baseUrl}/api/tokens/convert-to-shares`,
        data
      );
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Tokens converted to shares successfully!',
      });
      setSelectedCompanyId('');
      setQuantity('');
      setSelectedTokenizedShare(null);
      queryClient.invalidateQueries({
        queryKey: ['/api/tokens/available-for-conversion'],
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/overview'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert tokens',
        variant: 'destructive',
      });
    },
  });

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const tokenizedShare = tokenizedShares?.tokens?.find(
      (ts: any) => ts?.companyId === companyId
    );
    const selectedCompany = companies?.find((c: any) => c?.id === companyId);

    // Map the API response structure to the expected format
    if (tokenizedShare && selectedCompany) {
      const mappedTokenizedShare = {
        ...tokenizedShare,
        company: {
          name: selectedCompany?.name || 'Unknown',
          symbol: selectedCompany?.symbol || 'N/A',
          currentPrice: selectedCompany?.currentPrice || '0',
        },
      };
      setSelectedTokenizedShare(mappedTokenizedShare);
    } else {
      setSelectedTokenizedShare(null);
    }
    setQuantity('');
  };

  const handleConvert = () => {
    if (!selectedTokenizedShare || !quantity) {
      toast({
        title: 'Error',
        description: 'Please select a company and enter quantity',
        variant: 'destructive',
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (
      quantityNum <= 0 ||
      quantityNum > (selectedTokenizedShare?.quantity || 0)
    ) {
      toast({
        title: 'Error',
        description: 'Invalid quantity',
        variant: 'destructive',
      });
      return;
    }

    convertMutation.mutate({
      companyId: selectedCompanyId,
      quantity: quantityNum,
      price: selectedTokenizedShare?.company?.currentPrice || '0',
      tokenId: selectedTokenizedShare?.id,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateConversionValue = () => {
    if (!selectedTokenizedShare || !quantity) return null;

    const quantityNum = parseInt(quantity);
    const sharePrice = parseFloat(
      selectedTokenizedShare?.company?.currentPrice || '0'
    );
    const totalValue = sharePrice * quantityNum;

    return { sharePrice, totalValue };
  };

  const conversion = calculateConversionValue();

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='flex'>
        <Sidebar />

        <main className='flex-1 p-6'>
          <div className='max-w-2xl mx-auto'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Convert to Shares
              </h1>
              <p className='text-gray-600'>
                Convert your tokenized shares back to physical shares
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Undo2 className='mr-2 h-5 w-5' />
                  Token to Share Conversion
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
                      <SelectValue placeholder='Choose a company to convert' />
                    </SelectTrigger>
                    <SelectContent>
                      {companiesLoading ? (
                        <SelectItem value='loading' disabled>
                          <DataLoading text='Loading companies...' />
                        </SelectItem>
                      ) : companies && companies.length > 0 ? (
                        companies.map((company: any) => {
                          const availableTokens = tokenizedShares?.tokens?.find(
                            (ts: any) => ts?.companyId === company?.id
                          );
                          return (
                            <SelectItem
                              key={company?.id}
                              value={company?.id}
                              disabled={!availableTokens}
                            >
                              {company?.name || 'Unknown'} (
                              {company?.symbol || 'N/A'}) -{' '}
                              {availableTokens
                                ? `${
                                    availableTokens?.quantity || 0
                                  } tokens available`
                                : 'No tokens available'}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value='no-companies' disabled>
                          No companies available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTokenizedShare && (
                  <div className='bg-orange-50 p-4 rounded-lg'>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Selected Token Details
                    </h4>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <div className='flex justify-between'>
                        <span>Company:</span>
                        <span>
                          {selectedTokenizedShare?.company?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Available Tokens:</span>
                        <span>{selectedTokenizedShare?.quantity || 0}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Current Price:</span>
                        <span>
                          {formatCurrency(
                            parseFloat(
                              selectedTokenizedShare?.company?.currentPrice ||
                                '0'
                            )
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Tokenization Fee:</span>
                        <span>
                          {formatCurrency(
                            parseFloat(
                              selectedTokenizedShare?.tokenizationPrice || '0'
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor='quantity'>Number of Tokens to Convert</Label>
                  <Input
                    id='quantity'
                    type='number'
                    placeholder='Enter quantity'
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    max={selectedTokenizedShare?.quantity || 0}
                    min='1'
                  />
                  {selectedTokenizedShare && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Maximum: {selectedTokenizedShare?.quantity || 0} tokens
                    </p>
                  )}
                </div>

                {conversion && (
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <h4 className='flex items-center text-sm font-medium text-gray-900 mb-2'>
                      <Calculator className='mr-2 h-4 w-4' />
                      Conversion Summary
                    </h4>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <div className='flex justify-between'>
                        <span>Current Share Price:</span>
                        <span>
                          {formatCurrency(conversion?.sharePrice || 0)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Quantity:</span>
                        <span>
                          {quantity} tokens → {parseInt(quantity) / 10}{' '}
                          {parseInt(quantity) / 10 > 1 ? 'shares' : 'share'}
                        </span>
                      </div>

                      <div className='flex justify-between font-semibold text-gray-900 pt-2 border-t border-green-200'>
                        <span>Net Value:</span>
                        <span>
                          {formatCurrency(conversion?.totalValue / 10 || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className='bg-blue-50 p-4 rounded-lg'>
                  <div className='flex'>
                    <AlertCircle className='h-5 w-5 text-blue-400 mr-2' />
                    <div className='text-sm'>
                      <h4 className='font-medium text-blue-800'>
                        Conversion Information
                      </h4>
                      <ul className='mt-2 text-blue-700 space-y-1'>
                        <li>
                          • Converted shares will be added to your demat account
                        </li>
                        <li>• Conversion process takes 1-2 business days</li>

                        <li>• Conversion is irreversible once confirmed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className='flex space-x-3 pt-4'>
                  <Button
                    onClick={handleConvert}
                    disabled={
                      !selectedTokenizedShare ||
                      !quantity ||
                      convertMutation.isPending
                    }
                    className='flex-1 btn-convert'
                  >
                    {convertMutation.isPending
                      ? 'Processing...'
                      : 'Convert to Shares'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
