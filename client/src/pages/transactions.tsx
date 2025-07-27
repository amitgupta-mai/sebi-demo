import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Search, Download, Coins, ArrowRightLeft, Undo2, ShoppingCart, History } from "lucide-react";

export default function Transactions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

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

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const errors = [transactionsError, ordersError];
    for (const error of errors) {
      if (error && isUnauthorizedError(error as Error)) {
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
    }
  }, [transactionsError, ordersError, toast]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'tokenize':
        return <Coins className="h-4 w-4" />;
      case 'detokenize':
        return <Undo2 className="h-4 w-4" />;
      case 'trade_buy':
        return <ShoppingCart className="h-4 w-4" />;
      case 'trade_sell':
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'tokenize':
        return 'Tokenization';
      case 'detokenize':
        return 'Conversion';
      case 'trade_buy':
        return 'Buy Order';
      case 'trade_sell':
        return 'Sell Order';
      default:
        return 'Transaction';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'tokenize':
        return 'bg-blue-100 text-blue-800';
      case 'detokenize':
        return 'bg-orange-100 text-orange-800';
      case 'trade_buy':
        return 'bg-green-100 text-green-800';
      case 'trade_sell':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  // Filter and sort transactions
  const filteredTransactions = (transactions || []).filter((transaction: any) => {
    const matchesSearch = !searchTerm || 
      transaction.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.company.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || transaction.transactionType === filterType;
    
    return matchesSearch && matchesFilter;
  }).sort((a: any, b: any) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "amount") {
      return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
            <p className="text-gray-600">Complete record of all your trading activities</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by company name or symbol..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="tokenize">Tokenization</SelectItem>
                    <SelectItem value="detokenize">Conversion</SelectItem>
                    <SelectItem value="trade_buy">Buy Orders</SelectItem>
                    <SelectItem value="trade_sell">Sell Orders</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="amount">Sort by Amount</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="whitespace-nowrap">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                All Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No transactions found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.transactionType)}`}>
                            {getTransactionIcon(transaction.transactionType)}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className={getCompanyLogoClass(transaction.company.symbol)}>
                              <span>{transaction.company.symbol.substring(0, 3).toUpperCase()}</span>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900">{transaction.company.name}</h4>
                              <p className="text-sm text-gray-500">NSE: {transaction.company.symbol}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <Badge className={getTransactionColor(transaction.transactionType)}>
                            {getTransactionLabel(transaction.transactionType)}
                          </Badge>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(parseFloat(transaction.totalAmount))}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">{transaction.quantity} shares</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price per Share</p>
                          <p className="font-medium">{formatCurrency(parseFloat(transaction.price))}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fees</p>
                          <p className="font-medium">{formatCurrency(parseFloat(transaction.fees))}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Transaction ID</p>
                          <p className="font-medium font-mono text-xs">{transaction.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRightLeft className="mr-2 h-5 w-5" />
                Trading Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 10).map((order: any) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={getCompanyLogoClass(order.company.symbol)}>
                            <span>{order.company.symbol.substring(0, 3).toUpperCase()}</span>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900">{order.company.name}</h4>
                            <p className="text-sm text-gray-500">NSE: {order.company.symbol}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <Badge variant={order.orderType === "buy" ? "default" : "destructive"}>
                            {order.orderType.toUpperCase()}
                          </Badge>
                          
                          <Badge variant={
                            order.status === "completed" ? "default" :
                            order.status === "pending" ? "secondary" : "destructive"
                          }>
                            {order.status.toUpperCase()}
                          </Badge>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(parseFloat(order.price) * order.quantity)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">{order.quantity} tokens</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price per Token</p>
                          <p className="font-medium">{formatCurrency(parseFloat(order.price))}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Order ID</p>
                          <p className="font-medium font-mono text-xs">{order.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No trading orders found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
