import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Market from "@/pages/market";
import Wallet from "@/pages/wallet";
import Settings from "@/pages/settings";
import Tokenize from "@/pages/tokenize";
import Trading from "@/pages/trading";
import Convert from "@/pages/convert";
import Portfolio from "@/pages/portfolio";
import Transactions from "@/pages/transactions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/market" component={Market} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/tokenize" component={Tokenize} />
      <Route path="/trading" component={Trading} />
      <Route path="/convert" component={Convert} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
