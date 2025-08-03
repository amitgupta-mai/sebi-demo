import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, AlertCircle } from "lucide-react";

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenizedShare: any;
}

export default function ConvertModal({ isOpen, onClose, tokenizedShare }: ConvertModalProps) {
  const [quantity, setQuantity] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const convertMutation = useMutation({
    mutationFn: async (data: { companyId: string; quantity: number; price: string }) => {
      return await apiRequest("POST", "/api/convert-to-shares", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tokens converted to shares successfully!",
      });
      setQuantity("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/tokenized-shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          // Handle authentication in mock mode
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to convert tokens",
        variant: "destructive",
      });
    },
  });

  const handleConvert = () => {
    if (!tokenizedShare || !quantity) {
      toast({
        title: "Error",
        description: "Please enter quantity",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0 || quantityNum > tokenizedShare.quantity) {
      toast({
        title: "Error",
        description: "Invalid quantity",
        variant: "destructive",
      });
      return;
    }

    convertMutation.mutate({
      companyId: tokenizedShare.companyId,
      quantity: quantityNum,
      price: tokenizedShare.company.currentPrice,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateConversion = () => {
    if (!tokenizedShare || !quantity) return null;

    const quantityNum = parseInt(quantity);
    const sharePrice = parseFloat(tokenizedShare.company.currentPrice);
    const totalValue = sharePrice * quantityNum;

    return { sharePrice, totalValue };
  };

  const conversion = calculateConversion();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Shares</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {tokenizedShare && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Selected Token</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Company:</span>
                  <span>{tokenizedShare.company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Tokens:</span>
                  <span>{tokenizedShare.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span>{formatCurrency(parseFloat(tokenizedShare.company.currentPrice))}</span>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="quantity">Number of Tokens to Convert</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              max={tokenizedShare?.quantity || 0}
              min="1"
            />
            {tokenizedShare && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {tokenizedShare.quantity} tokens
              </p>
            )}
          </div>
          
          {conversion && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <Calculator className="mr-2 h-4 w-4" />
                Conversion Summary
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Current Share Price:</span>
                  <span>{formatCurrency(conversion.sharePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantity} tokens → {quantity} shares</span>
                </div>

                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-green-200">
                  <span>Net Value:</span>
                  <span>{formatCurrency(conversion.totalValue)}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-800">Conversion Information</h4>
                <ul className="mt-2 text-blue-700 space-y-1">
                  <li>• Converted shares will be added to your demat account</li>
                  <li>• Conversion process takes 1-2 business days</li>
                  <li>• You'll receive physical shares equivalent to tokens</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={!quantity || convertMutation.isPending}
              className="flex-1 btn-convert"
            >
              {convertMutation.isPending ? "Processing..." : "Convert to Shares"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
