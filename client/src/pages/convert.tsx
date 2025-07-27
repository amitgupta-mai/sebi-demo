import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Undo2, Calculator, AlertCircle } from "lucide-react";

export default function Convert() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [selectedTokenizedShare, setSelectedTokenizedShare] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: tokenizedShares, isLoading: tokensLoading, error: tokensError } = useQuery({
    queryKey: ["/api/tokenized-shares"],
    enabled: isAuthenticated,
  });

  const convertMutation = useMutation({
    mutationFn: async (data: { companyId: string; quantity: number; price: string }) => {
      return await apiRequest("POST", "/api/convert-to-shares", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tokens converted to shares successfully!",
      });
      setSelectedCompanyId("");
      setQuantity("");
      setSelectedTokenizedShare(null);
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
          window.location.href = "/api/login";
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

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const tokenizedShare = tokenizedShares?.find((ts: any) => ts.companyId === companyId);
    setSelectedTokenizedShare(tokenizedShare);
    setQuantity("");
  };

  const handleConvert = () => {
    if (!selectedTokenizedShare || !quantity) {
      toast({
        title: "Error",
        description: "Please select a company and enter quantity",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0 || quantityNum > selectedTokenizedShare.quantity) {
      toast({
        title: "Error",
        description: "Invalid quantity",
        variant: "destructive",
      });
      return;
    }

    convertMutation.mutate({
      companyId: selectedCompanyId,
      quantity: quantityNum,
      price: selectedTokenizedShare.company.currentPrice,
    });
  };

  useEffect(() => {
    if (tokensError && isUnauthorizedError(tokensError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [tokensError, toast]);

  if (!isAuthenticated || isLoading) {
    return <div>Loading...</div>;
  }

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
    const sharePrice = parseFloat(selectedTokenizedShare.company.currentPrice);
    const fee = 25; // Conversion fee
    const totalValue = (sharePrice * quantityNum) - fee;

    return { sharePrice, fee, totalValue: Math.max(0, totalValue) };
  };

  const conversion = calculateConversionValue();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Convert to Shares</h1>
              <p className="text-gray-600">Convert your tokenized shares back to physical shares</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Undo2 className="mr-2 h-5 w-5" />
                  Token to Share Conversion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="company">Select Company</Label>
                  <Select value={selectedCompanyId} onValueChange={handleCompanySelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a company to convert" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokensLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : tokenizedShares && tokenizedShares.length > 0 ? (
                        tokenizedShares.map((tokenizedShare: any) => (
                          <SelectItem key={tokenizedShare.companyId} value={tokenizedShare.companyId}>
                            {tokenizedShare.company.name} - {tokenizedShare.quantity} tokens available
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-tokens" disabled>No tokens available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTokenizedShare && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Token Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Company:</span>
                        <span>{selectedTokenizedShare.company.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Tokens:</span>
                        <span>{selectedTokenizedShare.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Price:</span>
                        <span>{formatCurrency(parseFloat(selectedTokenizedShare.company.currentPrice))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tokenization Price:</span>
                        <span>{formatCurrency(parseFloat(selectedTokenizedShare.tokenizationPrice))}</span>
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
                    max={selectedTokenizedShare?.quantity || 0}
                    min="1"
                  />
                  {selectedTokenizedShare && (
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: {selectedTokenizedShare.quantity} tokens
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
                      <div className="flex justify-between">
                        <span>Conversion Fee:</span>
                        <span>{formatCurrency(conversion.fee)}</span>
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
                        <li>• A small processing fee applies for conversions</li>
                        <li>• You'll receive physical shares equivalent to tokens</li>
                        <li>• Conversion is irreversible once confirmed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleConvert}
                    disabled={!selectedTokenizedShare || !quantity || convertMutation.isPending}
                    className="flex-1 btn-convert"
                  >
                    {convertMutation.isPending ? "Processing..." : "Convert to Shares"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conversion History */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Undo2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Your conversion history will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
