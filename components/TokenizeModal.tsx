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
import { Calculator, AlertCircle } from 'lucide-react';

interface TokenizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: any;
}

export default function TokenizeModal({
  isOpen,
  onClose,
  holding,
}: TokenizeModalProps) {
  const [quantity, setQuantity] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tokenizeMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      quantity: number;
      price: string;
    }) => {
      return await apiRequest('POST', '/api/tokenize', data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Shares tokenized successfully!',
      });
      setQuantity('');
      onClose();
      queryClient.invalidateQueries({ queryKey: ['/api/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokenized-shares'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/summary'] });
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
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to tokenize shares',
        variant: 'destructive',
      });
    },
  });

  const handleTokenize = () => {
    if (!holding || !quantity) {
      toast({
        title: 'Error',
        description: 'Please enter quantity',
        variant: 'destructive',
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0 || quantityNum > holding.quantity) {
      toast({
        title: 'Error',
        description: 'Invalid quantity',
        variant: 'destructive',
      });
      return;
    }

    tokenizeMutation.mutate({
      companyId: holding.companyId,
      quantity: quantityNum,
      price: holding.company.currentPrice,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateCosts = () => {
    if (!holding || !quantity) return null;

    const quantityNum = parseInt(quantity);
    const sharePrice = parseFloat(holding.company.currentPrice);
    const total = sharePrice * quantityNum;

    return { sharePrice, total };
  };

  const costs = calculateCosts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Tokenize Shares</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {holding && (
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='font-medium text-gray-900 mb-2'>
                Selected Company
              </h4>
              <div className='text-sm text-gray-600 space-y-1'>
                <div className='flex justify-between'>
                  <span>Company:</span>
                  <span>{holding.company.name}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Available Shares:</span>
                  <span>{holding.quantity}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Current Price:</span>
                  <span>
                    {formatCurrency(parseFloat(holding.company.currentPrice))}
                  </span>
                </div>
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
              max={holding?.quantity || 0}
              min='1'
            />
            {holding && (
              <p className='text-xs text-gray-500 mt-1'>
                Maximum: {holding.quantity} shares
              </p>
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
                  <span>Current Share Price:</span>
                  <span>{formatCurrency(costs.sharePrice)}</span>
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
                  <li>• Tokenized shares can be traded 24/7</li>
                  <li>• You can convert tokens back to shares anytime</li>
                  <li>• Tokenization is irreversible once confirmed</li>
                </ul>
              </div>
            </div>
          </div>

          <div className='flex space-x-3 pt-4'>
            <Button variant='outline' onClick={onClose} className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={handleTokenize}
              disabled={!quantity || tokenizeMutation.isPending}
              className='flex-1 bg-primary hover:bg-blue-700'
            >
              {tokenizeMutation.isPending ? 'Processing...' : 'Tokenize Shares'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
