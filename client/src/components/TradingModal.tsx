import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: any[];
  tokenizedShares: any[];
}

export default function TradingModal({
  isOpen,
  onClose,
  companies,
  tokenizedShares,
}: TradingModalProps) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      orderType: 'buy' | 'sell';
      quantity: number;
      price: string;
    }) => {
      return await apiRequest('POST', '/api/orders', data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Order placed successfully!',
      });
      setSelectedCompanyId('');
      setQuantity('');
      setPrice('');
      onClose();
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          // Handle authentication in mock mode
          console.log('Mock authentication required');
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      });
    },
  });

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

    // For sell orders, check if user has enough tokens
    if (orderType === 'sell') {
      const tokenizedShare = tokenizedShares?.find(
        (ts: any) => ts.companyId === selectedCompanyId
      );
      if (!tokenizedShare || tokenizedShare.quantity < quantityNum) {
        toast({
          title: 'Error',
          description: 'Insufficient tokens to sell',
          variant: 'destructive',
        });
        return;
      }
    }

    createOrderMutation.mutate({
      companyId: selectedCompanyId,
      orderType,
      quantity: quantityNum,
      price: `${priceNum}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getAvailableTokens = (companyId: string) => {
    const tokenizedShare = tokenizedShares?.find(
      (ts: any) => ts.companyId === companyId
    );
    return tokenizedShare?.quantity || 0;
  };

  const selectedCompany = companies?.find(
    (c: any) => c.id === selectedCompanyId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Place Trading Order</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <Tabs
            value={orderType}
            onValueChange={(value) => setOrderType(value as 'buy' | 'sell')}
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
                {companies && companies.length > 0 ? (
                  companies.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.symbol} - {company.name}
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

          {selectedCompany && (
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='font-medium text-gray-900 mb-2'>
                Company Details
              </h4>
              <div className='text-sm text-gray-600 space-y-1'>
                <div className='flex justify-between'>
                  <span>Current Price:</span>
                  <span>
                    {formatCurrency(parseFloat(selectedCompany.currentPrice))}
                  </span>
                </div>
                {orderType === 'sell' && (
                  <div className='flex justify-between'>
                    <span>Available Tokens:</span>
                    <span>{getAvailableTokens(selectedCompanyId)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor='quantity'>Quantity</Label>
            <Input
              id='quantity'
              type='number'
              placeholder='Enter quantity'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min='1'
              max={
                orderType === 'sell'
                  ? getAvailableTokens(selectedCompanyId)
                  : undefined
              }
            />
            {orderType === 'sell' && selectedCompanyId && (
              <p className='text-xs text-gray-500 mt-1'>
                Maximum: {getAvailableTokens(selectedCompanyId)} tokens
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='price'>Price</Label>
            <Input
              id='price'
              type='number'
              step='0.01'
              placeholder='Enter price'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            {selectedCompany && (
              <p className='text-xs text-gray-500 mt-1'>
                Market price:{' '}
                {formatCurrency(parseFloat(selectedCompany.currentPrice))}
              </p>
            )}
          </div>

          {quantity && price && (
            <div className='bg-green-50 p-4 rounded-lg'>
              <h4 className='text-sm font-medium text-gray-900 mb-2'>
                Order Summary
              </h4>
              <div className='text-sm text-gray-600 space-y-1'>
                <div className='flex justify-between'>
                  <span>Order Type:</span>
                  <span
                    className={
                      orderType === 'buy' ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {orderType.toUpperCase()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Quantity:</span>
                  <span>{quantity} tokens</span>
                </div>
                <div className='flex justify-between'>
                  <span>Price:</span>
                  <span>{formatCurrency(parseFloat(price))}</span>
                </div>
                <div className='flex justify-between font-semibold text-gray-900 pt-2 border-t border-green-200'>
                  <span>Total {orderType === 'buy' ? 'Cost' : 'Value'}:</span>
                  <span>
                    {formatCurrency(parseFloat(quantity) * parseFloat(price))}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className='flex space-x-3 pt-4'>
            <Button variant='outline' onClick={onClose} className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={
                !selectedCompanyId ||
                !quantity ||
                !price ||
                createOrderMutation.isPending
              }
              className={`flex-1 ${
                orderType === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {createOrderMutation.isPending
                ? 'Placing Order...'
                : `Place ${orderType.toUpperCase()} Order`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
